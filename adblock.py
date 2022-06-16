import requests
import json
from termcolor import colored


def is_ascii(s):
    return all(ord(c) < 128 for c in s)


def make_structure_of_rule(url, id):
    return {
        "id": id,
        "priority": 1,
        "action": {"type": "block"},
        "condition": {
            "urlFilter": url,
            "resourceTypes": ["image", "xmlhttprequest"]
        }
    }


def generate_rules_json_file():
    ADURL = "https://easylist.to/easylist/easylist.txt"
    r = requests.get(url=ADURL)
    rule_arr = []
    for idx, url in enumerate(r.text.splitlines()):
        if idx < 16:
            continue
        if not is_ascii(url):
            continue
        rule_arr.append(
            make_structure_of_rule(url, len(rule_arr)+1)
        )

    TRACKER_URL = "https://easylist.to/easylist/easyprivacy.txt"
    r = requests.get(url=TRACKER_URL)
    for idx, tracker_url in enumerate(r.text.splitlines()):
        if idx < 14:
            continue
        if not is_ascii(tracker_url):
            continue
        rule_arr.append(
            make_structure_of_rule(tracker_url, len(rule_arr)+1)
        )
    return rule_arr


if __name__ == '__main__':
    rule_arr = generate_rules_json_file()
    with open("./rules.json", "w") as f:
        json.dump(rule_arr, f)
        print(
            colored("rule.json written", "yellow")
        )
