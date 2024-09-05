from zipfile import ZipFile
import sqlite3
import json
import os
from uuid import uuid4
import sys
import re
import shutil
import click

import firebase_admin
from firebase_admin import firestore

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()

# This script requires
# - sys.argv[1] -> class
# - sys.argv[2] -> author
# - target.apkg

# READ: https://github.com/SergioFacchini/anki-cards-web-browser/blob/master/documentation/Processing%20Anki's%20.apkg%20files.md


def process_anki(packClass, author):
    # Make an out directory
    if os.path.exists("out"):
        shutil.rmtree("out")
    os.makedirs("out")

    # Clean the temp directory
    if os.path.exists("temp"):
        shutil.rmtree("temp")

    # Extract the .apkg file
    with ZipFile("target.apkg", "r") as zip_ref:
        zip_ref.extractall("temp")

    # Connect to the database
    connection = sqlite3.connect("temp/collection.anki2")
    cursor = connection.cursor()

    # JSON of the deck's metadata
    # print(json.dumps(json.loads(metadata[0][0]), indent=4))
    metadata = json.loads(cursor.execute("SELECT models FROM col").fetchall()[0][0])

    for key, value in metadata.items():
        pack = {
            "name": value["name"],
            "uid": "none",
            "date": "∞",
            "class": packClass,
            "content": [],
            "published": True,
            "uuid": str(uuid4()),
            "author": "tomes",
            "superficialAuthor": author,
            "folder": packClass,
            "categories": {
                "default": {
                    "colors": ["transparent", "transparent"],
                    "name": "Default",
                },
            },
        }

        print(key, value["name"])
        res = cursor.execute("SELECT * FROM notes WHERE mid = ?", (key,)).fetchall()

        for card in res:
            # Throw away any cards with a semicolon or equals sign in the term
            if card[7] is None or card[7].find(";") != -1 or card[7].find("=") != -1:
                continue

            split = card[6].split("\x1f")
            term = split[0]
            definition = split[1]

            pack["content"].append(
                {
                    "term": term,
                    "definition": definition,
                    "uuid": str(uuid4()),
                    "category": "default",
                }
            )

        # Write the deck to a file
        scrubbed = re.sub("\W+", "_", value["name"])
        location = f"out/{scrubbed}.json"
        with open(location, "w") as file:
            file.write(json.dumps(pack, indent=4))

        # Write the deck to the database
        if click.confirm(
            f"View the created pack in {location}\nWould you like to upload the pack to Pecto?",
            default=True,
        ):
            db.collection("packs/tomes/packs").document(pack["uuid"]).set(pack)


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        process_anki(sys.argv[1], sys.argv[2])
