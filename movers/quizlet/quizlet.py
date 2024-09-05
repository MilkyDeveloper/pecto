import json
import os
import hashlib
from uuid import UUID, uuid4
import sys
import re
import click
from bs4 import BeautifulSoup
import cloudscraper
import time

import firebase_admin
from firebase_admin import firestore

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()

# Quizlet's API has cloudflare protection
scraper = cloudscraper.create_scraper()

# Create an MD5 hash object
m = hashlib.md5()

# Today's UUID
today = str(uuid4())

def url_to_id(url):
    return url.split("/")[3]


def profile_to_tome(profile):
    print(f"Uploading all Quizlets from {profile} to the Tomes")

    with open(f"{profile}.html", encoding="utf8") as file:
        html = file.read()

    # Parse it!
    soup = BeautifulSoup(html, "html.parser")

    # Get all Quizlets
    quizlets = soup.select(".DashboardListItem a.UILink")

    # Process each Quizlet
    for quizlet in quizlets:
        process_quizlet(
            url_to_id(quizlet["href"]),
            quizlet.find("span").text,
            profile,
            "",
            skip=True,
        )
        # Don't trigger bot detection
        time.sleep(1)


def process_quizlet(id, title, author, packClass, skip=False):
    # Make an out directory
    if not os.path.exists("out"):
        os.makedirs("out")

    # Goofy Quizlet has left their API open!!!
    quizlet = json.loads(
        scraper.get(
            f"https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D={id}&filters%5BstudiableContainerType%5D=1&perPage=1000&page=1"
        ).text
    )

    # Generate a reproducible UUID
    m.update(title.encode("utf-8"))

    # Base Pack
    pack = {
        "name": title,
        "uid": "none",
        "date": "∞",
        "class": packClass,
        "content": [],
        "published": True,
        "uuid": str(UUID(m.hexdigest())),
        "author": "tomes",
        "superficialAuthor": author,
        "folder": packClass,
        "categories": {
            "default": {
                "colors": ["transparent", "transparent"],
                "name": "Default",
            },
        },
        # Not consumed by the client side
        # In case something goes wrong we can mass delete
        "internalCategory": today,
    }

    for item in quizlet["responses"][0]["models"]["studiableItem"]:
        try:
            pack["content"].append(
                {
                    "term": item["cardSides"][0]["media"][0]["plainText"],
                    "definition": item["cardSides"][1]["media"][0]["plainText"],
                    "uuid": str(uuid4()),
                    "category": "default",
                }
            )
        except:
            continue

    # Write the deck to a file
    scrubbed = re.sub("\W+", "_", title)
    location = f"out/{scrubbed}.json"
    with open(location, "w") as file:
        file.write(json.dumps(pack, indent=4))

    # Write the deck to the database
    if skip:
        db.collection("packs/tomes/packs").document(pack["uuid"]).set(pack)
        return

    if click.confirm(
        f"View the created pack in {location}\nWould you like to upload the pack to Pecto?",
        default=True,
    ):
        db.collection("packs/tomes/packs").document(pack["uuid"]).set(pack)


if __name__ == "__main__":
    if len(sys.argv) == 3:
        profile_to_tome(sys.argv[1])
    elif len(sys.argv) == 4:
        with open(sys.argv[1]) as file:
            global className
            className = ""
            for line in file:
                if line.find("CLASS=") != -1:
                    className = line.split("CLASS=")[1].replace("\n", "")
                else:
                    process_quizlet(
                        url_to_id(line),
                        f"{className} {line.split(',')[1].strip()}",
                        "Archived in the Tomes",
                        className,
                        skip=True if sys.argv[3] == "auto" else False,
                    )
    elif len(sys.argv) >= 5:
        process_quizlet(url_to_id(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4])
