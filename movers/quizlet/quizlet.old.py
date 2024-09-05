import json
import os
from uuid import uuid4
import sys
import re
import shutil
import click
from bs4 import BeautifulSoup
import requests
import time

import firebase_admin
from firebase_admin import firestore

# 
# 
# 
# USE THIS -> https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=822716358&filters%5BstudiableContainerType%5D=1&perPage=1000&page=1
# 
# 
# 

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()

# Basic User Agent
headers = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'max-age=0',
  'cookie': 'yourcookie',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (X11; CrOS x86_64 12239.92.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.136 Safari/537.36',
}

def profile_to_tome(profile):
	print(f"Uploading all Quizlets from {profile} to the Tomes")

	if os.path.exists(f"{profile}.html"):
		with open(f"{profile}.html", encoding="utf8") as file:
			html = file.read()

		# Parse it!
		soup = BeautifulSoup(html, "html.parser")
	else :
		# Parse it!
		soup = BeautifulSoup(requests.get(f"https://quizlet.com/{profile}", headers=headers).text, "html.parser")

	# Get all Quizlets
	quizlets = soup.select(".DashboardListItem a.UILink")

	# Process each Quizlet
	for quizlet in quizlets:
		process_quizlet(quizlet["href"], skip=True)
		# Don't trigger bot detection
		time.sleep(1)

def process_quizlet(url, skip=False):
	# Make an out directory
	if os.path.exists("out"):
		shutil.rmtree("out")
	os.makedirs("out")

	# Parse it!
	soup = BeautifulSoup(requests.get(url, headers=headers).text, "html.parser")

	# Extract the metadata
	title = soup.title.string.replace(" | Quizlet", "")
	author = soup.select_one(".UserLink-username").text
	packClass = soup.select_one("ol.AssemblyBreadcrumbs-list").getText(strip=True, separator="/")

	# Base Pack
	pack = {
		"name": title,
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

	for _i, (term, definition) in enumerate(
		zip(
			soup.select(".SetPageTerm-wordText span"),
			soup.select(".SetPageTerm-definitionText span"),
		),
		1,
	):
		pack["content"].append(
			{
				"term": term.get_text(strip=True, separator='\n'),
				"definition": definition.get_text(strip=True, separator='\n'),
				"uuid": str(uuid4()),
				"category": "default",
			}
		)

	# Write the deck to a file
	scrubbed = re.sub("\W+", "_", title)
	location = f"out/{scrubbed}.json"
	with open(location, "w") as file:
		file.write(json.dumps(pack, indent=4))

	# Write the deck to the database
	if (skip):
		db.collection("packs/tomes/packs").document(pack["uuid"]).set(pack)
		return
	
	if click.confirm(
		f"View the created pack in {location}\nWould you like to upload the pack to Pecto?",
		default=True,
	):
		db.collection("packs/tomes/packs").document(pack["uuid"]).set(pack)


if __name__ == "__main__":
	if (len(sys.argv) >= 2):
		if (sys.argv[1].find("quizlet.com") != -1):
			process_quizlet(sys.argv[1])
		else:
			profile_to_tome(sys.argv[1])