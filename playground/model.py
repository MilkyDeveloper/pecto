import json
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from datasets import Dataset, concatenate_datasets
import evaluate
import nltk
import numpy as np
from nltk.tokenize import sent_tokenize
from transformers import DataCollatorForSeq2Seq
from huggingface_hub import HfFolder
from transformers import pipeline
from random import randrange
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments
import os

# see - https://duarteocarmo.com/blog/fine-tune-flan-t5-telegram
# see - https://www.philschmid.de/fine-tune-flan-t5

# Convert it to a dataset
data = Dataset.from_parquet("out.parquet").train_test_split(test_size=0.2)

MODEL_ID = "google/flan-t5-small"
REPO = "flan-t5-termdef"

# Load the model of FLAN-t5-base
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)

# Load the tokenizer of FLAN-t5-base
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)

# Source
tokenized_inputs = concatenate_datasets([data["train"], data["test"]]).map(
    # We turn truncation off because of how long the summaries are
    lambda x: tokenizer(x["definition"], truncation=True),
    batched=True,
)
max_source_length = max([len(x) for x in tokenized_inputs["input_ids"]])

# Target
tokenized_targets = concatenate_datasets([data["train"], data["test"]]).map(
    lambda x: tokenizer(x["term"], truncation=True), batched=True
)
max_target_length = max([len(x) for x in tokenized_targets["input_ids"]])


def preprocess_function(sample, padding="max_length"):
    # Important - this is our prompt
    template_start = "What is the subject line for this email?\n\n"
    inputs = [template_start + item for item in sample["definition"]]

    model_inputs = tokenizer(
        inputs, max_length=max_source_length, padding=padding, truncation=True
    )

    labels = tokenizer(
        text_target=sample["term"],
        max_length=max_target_length,
        padding=padding,
        truncation=True,
    )

    if padding == "max_length":
        labels["input_ids"] = [
            [(l if l != tokenizer.pad_token_id else -100) for l in label]
            for label in labels["input_ids"]
        ]

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


tokenized_dataset = data.map(
    preprocess_function, batched=True, remove_columns=["term", "definition"]
)

nltk.download("punkt")

# Metric
metric = evaluate.load("rouge")


# helper function to postprocess text
def postprocess_text(preds, labels):
    preds = [pred.strip() for pred in preds]
    labels = [label.strip() for label in labels]

    # rougeLSum expects newline after each sentence
    preds = ["\n".join(sent_tokenize(pred)) for pred in preds]
    labels = ["\n".join(sent_tokenize(label)) for label in labels]

    return preds, labels


# TODO: learn what this does
def compute_metrics(eval_preds):
    preds, labels = eval_preds
    if isinstance(preds, tuple):
        preds = preds[0]
    decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
    # Replace -100 in the labels as we can't decode them.
    labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

    # Some simple post-processing
    decoded_preds, decoded_labels = postprocess_text(decoded_preds, decoded_labels)

    result = metric.compute(
        predictions=decoded_preds, references=decoded_labels, use_stemmer=True
    )
    result = {k: round(v * 100, 4) for k, v in result.items()}
    prediction_lens = [
        np.count_nonzero(pred != tokenizer.pad_token_id) for pred in preds
    ]
    result["gen_len"] = np.mean(prediction_lens)
    return result

# we want to ignore tokenizer pad token in the loss
label_pad_token_id = -100
# Data collator
data_collator = DataCollatorForSeq2Seq(
    tokenizer,
    model=model,
    label_pad_token_id=label_pad_token_id,
    pad_to_multiple_of=8
)

# Define training args
training_args = Seq2SeqTrainingArguments(
    output_dir=REPO,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    predict_with_generate=True,
    fp16=False, # Overflows with fp16
    learning_rate=5e-5,
    num_train_epochs=4,
    # logging & evaluation strategies
    logging_dir=f"{REPO}/logs",
    logging_strategy="steps",
    logging_steps=500,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    save_total_limit=2,
    load_best_model_at_end=True,
    # push to hub parameters
    report_to="tensorboard",
    push_to_hub=False,
    hub_strategy="every_save",
    hub_model_id=REPO,
    hub_token=HfFolder.get_token(),
)

# Create Trainer instance
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    data_collator=data_collator,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    compute_metrics=compute_metrics,
)

# Start training
trainer.train()

# Save it
trainer.save_model(REPO)
tokenizer.save_pretrained(REPO)
# trainer.create_model_card()
# trainer.push_to_hub()
# tokenizer.push_to_hub(REPO)