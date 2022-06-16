import requests
import json


def generate_rules_json_file():
    URL = "https://easylist.to/easylist/easylist.txt"
    r = requests.get(url=URL)
    rule_arr = []
    for idx, url in enumerate(r.text.splitlines()):
        if idx < 16:
            continue
        rule_arr.append(
            {
                "id": 1,
                "priority": 1,
                "action": {"type": "block"},
                "condition": {
                    "urlFilter": url,
                    "resourceTypes": ["image", "xmlhttprequest"]
                }
            }
        )
        break

    with open("./rules.json", "w") as f:
        json.dump(rule_arr, f)
        print("rule.json written")


if __name__ == '__main__':
    generate_rules_json_file()
