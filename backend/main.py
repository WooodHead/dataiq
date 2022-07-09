from typing import Union
from fastapi import FastAPI, Request
from starlette.config import Config
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi import Response
from fastapi.responses import JSONResponse
from urllib.parse import urlparse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles


import json
import uvicorn
from os import getenv
from db_conns import MongoDb
from fastapi import FastAPI, Body, Depends
from models import UserSchema, UserLoginSchema
from auth.auth_bearer import JWTBearer
from auth.auth_handler import signJWT
from urllib.parse import urlparse
from os import getenv

templates = Jinja2Templates(directory="./templates")

app = FastAPI()
app.mount("/js", StaticFiles(directory="./templates/js/"), name="js")
app.add_middleware(SessionMiddleware, secret_key="!secret123;;//")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
config = Config()
oauth = OAuth(config)
oauth.register(
    name='google',
    server_metadata_url=CONF_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

startup_vars = {}


def store_and_generate_jwt(request, resp):
    user = request.session.get("user", None)
    if not user:
        return
    if user:
        email = user.get("email")
        db = startup_vars.get("db", None)
        if not db:
            # TODO: implement logger mechanism
            print(colored("Mongo Client not initialized", "red"))
        else:
            if not db.check_record_exists(email, collection_name="user_data"):
                operation_flag = db.update_record(
                    data={
                        "email": email,
                        "info": user
                    }, collection_name="user_data")
        if email:
            acc_token = signJWT(email).get("access_token", None)
            if acc_token:
                set_unset_cookies(request, resp=resp,
                                  set_flag=True, acc_token=acc_token, user=user)


def set_unset_cookies(request, resp, set_flag, acc_token=None, user=None):
    if set_flag:
        resp.set_cookie(key="access_token", value=acc_token,
                        domain=request.client.host)
        name = user.get("given_name", None)
        email = user.get("email", None)
        resp.set_cookie(key="name", value=name, domain=request.client.host)
        resp.set_cookie(key="email", value=email, domain=request.client.host)
    else:
        resp.delete_cookie("access_token", domain=request.client.host)
        resp.delete_cookie("email", domain=request.client.host)
        resp.delete_cookie("name", domain=request.client.host)


@app.on_event("startup")
async def on_startup():
    startup_vars["db"] = MongoDb()


@app.on_event("shutdown")
async def on_shutdown():
    client = startup_vars.get("db", None)
    if client:
        client.close()


@app.get('/')
def index(request: Request):
    context_dict = {
        "request": request,
    }
    resp = templates.TemplateResponse("index.html", context=context_dict)
    return resp


@app.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get('/auth')
async def auth(request: Request, response: Response):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        return HTMLResponse(f'<h1>{error.error}</h1>')
    user = token.get('userinfo')
    if user:
        request.session['user'] = dict(user)
    resp = RedirectResponse(url='/')
    store_and_generate_jwt(request, resp)
    return resp


@app.get('/logout')
async def logout(request: Request):
    resp = RedirectResponse(url='/')
    set_unset_cookies(request, resp, False, acc_token=None, user=None)
    request.session.pop('user', None)
    return resp


@app.post("/save_user_data", dependencies=[Depends(JWTBearer())])
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
        data=user_data,
        collection_name="user_data"
    )
    if not operation_flag:
        return {
            "error": True
        }
    return {
        "error": False
    }


@app.post("/calculate_points", dependencies=[Depends(JWTBearer())])
async def calculate_points():
    data = await request.json()
    if not isinstance(data, dict) or not user_data.get("email", None):
        return {
            "error": True,
            "message": "Incorrect data format"
        }
    db = startup_vars.get("db", None)
    if not db:
        print(colored("Mongo Client not initialized", "red"))
        return {"error": True, "message": "Mongo Client not initialized"}
    ret_val = db.get_length_of_search_term_visited_href(data, "user_data")
    resp = {}
    if not ret_val["error"]:
        import math
        resp["error"] = False
        resp["points"] = (ret_val.get("sum", 0) + data.get("sum", 0))/100.0
        resp["points"] = math.round(resp["points"])
        return resp
    resp["error"] = True
    resp["message"] = "unable to calculate points"
    return resp

if __name__ == "__main__":
    uvicorn.run("main:app", host='127.0.0.1', port=8000, reload=True)
