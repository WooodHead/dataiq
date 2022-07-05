from typing import Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from db_conns import MongoDb

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

startup_vars = {}

@app.on_event("startup")
async def on_startup():
    startup_vars["db"] = MongoDb()

@app.on_event("shutdown")
async def on_shutdown():
    client = startup_vars.get("db", None)
    if client:
        client.close()

@app.post("/save_user_data/")
async def save_user_data(request: Request):
    user_data = await request.json()
    if not isinstance(user_data, dict) or not user_data.get("email", None):
        return {"error": "Incorrect user_data format"}
    db = startup_vars.get("db", None)
    if not db:
        print(
            colored("Mongo Client not initialized", "red")
        )
        return {
            "error": True
        } 
    operation_flag = db.update_record(
        data = user_data,
        collection_name = "user_data"
    )
    if not operation_flag:
        return {
            "error": True
        }
    return {
        "error": False
    }
if __name__ == "__main__":
    uvicorn.run("main:app", host='127.0.0.1', port=8000, reload=True)

    