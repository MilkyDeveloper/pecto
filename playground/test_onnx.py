import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from optimum.onnxruntime import ORTModelForSeq2SeqLM

test = "The plasma membrane also carries receptors, which are attachment sites for specific substances that interact with the cell. Each receptor is structured to bind with a specific substance. For example, surface receptors of the membrane create changes in the interior, such as changes in enzymes of metabolic pathways."
prompt = "What is the subject line for this email?\n\n"

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
    # Higher temperatures produce more specific results
    "temperature": 0.9,
    "num_return_sequences": 1,
    "repetition_penalty": 1.3,
}


def subject(input):
    encoded_conversation = tokenizer(prompt + input, return_tensors="pt").input_ids.to(
        device
    )
    output_encoded = model.generate(encoded_conversation, **generation_params)

    output_decoded = tokenizer.decode(output_encoded[0], skip_special_tokens=True)
    return output_decoded


print(f"Original: {subject(test)}")

tokenizer = AutoTokenizer.from_pretrained("models/flan-t5-termdef")
model = ORTModelForSeq2SeqLM.from_pretrained(
    "models/flan-t5-termdef",
    decoder_file_name="decoder_model_quantized.onnx",
    use_cache=False,
    use_io_binding=False,
)

inputs = tokenizer(prompt + test, return_tensors="pt")
gen_tokens = model.generate(**inputs, **generation_params)

print(f"ONNX: {tokenizer.batch_decode(gen_tokens)}")
