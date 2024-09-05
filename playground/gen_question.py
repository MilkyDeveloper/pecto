from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")

context = "Proximal Convoluted Tubule"
background = "Location of reabsorption, where the 'good stuff' filtered is reclaimed - Water, Amino Acids, Glucose, NA+, and H2O go out of the filtrate back to the blood"

prompt = f"{background}\n\n{context}\n\nAsk a question about this article."

inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs)
print(tokenizer.batch_decode(outputs, skip_special_tokens=True))