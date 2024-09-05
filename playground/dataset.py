import json

import pyarrow as pa
import pyarrow.parquet as pq

# source - Cohere/wikipedia-22-12
# link - https://huggingface.co/datasets/Cohere/wikipedia-22-12/blob/main/simple/000.jsonl.gz

input = "000.jsonl"
cache = "selected.json"
out = "out.json"
entries = 20000

# if os.path.isfile(cache):
#     # read the cache
#     with open(cache, "r") as read:
#         arr = json.load(read)
# else:
#     # parse the data
#     with open(input, "r") as read:
#         arr = []
#         for line in read:
#             arr.append(json.loads(line))
#     arr = arr[:5000]
#     # write it to the cache for the future
#     with open(cache, "w") as write:
#         json.dump(arr, write)

# parse the data
with open(input, "r") as read:
    arr = []
    for line in read:
        arr.append(json.loads(line))
arr = arr[:entries]
# write it to the cache for the future
with open(cache, "w") as write:
    json.dump(arr, write)

# clear the output file
with open(out, "w") as write:
    write.write("")


# with alive_bar(len(arr), manual=True) as bar:
def process(topic, last):
    # # get the text
    # try:
    # 	text = wikipedia.page(topic["title"]).content
    # except:
    # 	return
    # # remove newlines
    # text = text.replace("\n", " ")
    # # construct a dataset
    # data = {
    # 	"content": text,
    # 	"summarization": json.dumps({"term": topic["title"], "definition": topic["text"]}),
    # }

    # # save it!
    # # with open(out, "a") as append:
    # # 	append.write(data)
    # # 	append.write("\n")
    # # show our progress

    data = {
        "term": topic["title"],
        "definition": last + topic["text"],
    }

    print(f"{topic['id']+1}/{len(arr)}")

    return data


# # yeehawwww
# # gets done in a minute on a 6800H
# dataset = Parallel(n_jobs=os.cpu_count() * 16, prefer="threads")(
# 	delayed(process)(topic) for topic in arr
# )
# print(f"Dataset contains {len(dataset)} entries")

# # remove dingleberries
# dataset = list(filter(lambda item: item is not None, dataset))

# loop through arr and process each topic
dataset = []
last = ""
for index, topic in enumerate(arr):
    data = process(topic, last)
    dataset.append(data)
    last = topic["text"]

# save it in json
with open("out.json", "w") as write:
    json.dump(dataset, write)

# save it in parquet
pq.write_table(pa.Table.from_pylist(dataset), "out.parquet")
