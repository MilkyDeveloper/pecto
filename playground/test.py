import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

import wikipedia
from pprint import pprint

dir = "flan-t5-termdef"
tokenizer = AutoTokenizer.from_pretrained(dir)
model = AutoModelForSeq2SeqLM.from_pretrained(dir)

# put model on GPU
device = "cuda:0" if torch.cuda.is_available() else "cpu"
model = model.to(device)

# remember to learn and tweak these params
generation_params = {
    "max_length": 20,
    "no_repeat_ngram_size": 1,
    "do_sample": True,
    "top_k": 50,
    "top_p": 0.95,
    # Lower temperatures produce more repeatable results
    "temperature": 0.1,
    "num_return_sequences": 1,
    "repetition_penalty": 1.3,
}


def subject(input):
    encoded_conversation = tokenizer(
        f"What is the subject line for this email?\n\n{input}", return_tensors="pt"
    ).input_ids.to(device)
    output_encoded = model.generate(encoded_conversation, **generation_params)

    output_decoded = tokenizer.decode(output_encoded[0], skip_special_tokens=True)
    return output_decoded

# # Input loop
# while True:
#     content = wikipedia.page(
#     input("What Wikipedia article would you like to generate flashcards for? ")
#     ).content.split("\n")

#     # Filter out sentences that don't contain ?, !, or .
#     content = [sentence for sentence in content if "?" in sentence or "!" in sentence or "." in sentence]

#     # Construct a JSON flashcard/pair
#     flashcards = []
#     for chunk in content:
#         flashcards.append(
#             {
#                 "term": subject(chunk),
#                 "definition": chunk,
#             }
#         )

#     pprint(flashcards, sort_dicts=False)

while True:
    print(subject(input("Enter a chunk: ")))