from os import getenv
from pymongo import MongoClient
from pymongo.errors import OperationFailure
from termcolor import colored
MONGO_DEFAULT_DB = getenv("MONGO_DEFAULT_DB", "dataiq")

class MongoDb:
    def __init__(self):
        self.client = MongoClient()
    def update_record(self, data, collection_name, db = MONGO_DEFAULT_DB) -> bool:
        if not isinstance(data, dict) or not data.get("email", None):
            print(
                colored("Incorrect format of data argument", "red")
            )
            return False
        email = data.get("email", None)
        serach_cond = {"email": email}
        exists_flag = bool(self.client[db][collection_name].find_one(serach_cond))
        if exists_flag:
            try:
                self.client[db][collection_name].update_one(serach_cond, {data})
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