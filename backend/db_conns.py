from os import getenv
from pymongo import MongoClient
from pymongo.errors import OperationFailure
from termcolor import colored
MONGO_DEFAULT_DB = getenv("MONGO_DEFAULT_DB", "dataiq")


class MongoDb:
    def __init__(self):
        self.client = MongoClient()

    def check_record_exists(self, email, collection_name, db=MONGO_DEFAULT_DB) -> bool:
        return bool(self.client[db][collection_name].find_one({"email": email}))

    def update_record(self, data, collection_name, db=MONGO_DEFAULT_DB) -> bool:
        if not isinstance(data, dict) or not data.get("email", None):
            print(
                colored("Incorrect format of data argument", "red")
            )
            return False
        email = data.get("email", None)
        search_cond = {"email": email}
        record = self.client[db][collection_name].find_one(
            search_cond)
        if record:
            try:
                mongo_id = record.get("_id")
                self.client[db][collection_name].update_one(
                    {"_id": mongo_id}, {"$set": data})
            except OperationFailure:
                print(
                    colored("failed to update record", "red")
                )
                return False
        else:
            try:
                self.client[db][collection_name].insert_one(data)
            except OperationFailure:
                print(
                    colored("failure to insert record", "red")
                )
                return False
        return True

    def get_length_of_search_term_visited_href(self, data, collection_name, db=MONGO_DEFAULT_DB) -> dict:
        email = data.get("email", None)
        if not email:
            return {
                "error": True,
            }
        search_cond = {"email": email}
        docs = self.client[db][collection_name].find(search_cond, {
            "user_search_terms": 1,
            "user_visited_hrefs": 1
        })
        sum_ = 0
        for record in docs:
            user_search_terms = record.get("user_search_terms", [])
            user_visited_hrefs = record.get("user_visited_hrefs", [])
            sum_ = len(user_search_terms) + len(user_visited_hrefs)
            break
        return {
            "error": False,
            "sum": sum_
        }
