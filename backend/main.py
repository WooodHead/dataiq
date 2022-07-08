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
    user = request.session.get("user", None)
    if user:
        name = user.get("given_name")
        context_dict["name"] = name.upper() if name else None
    return templates.TemplateResponse("index.html", context=context_dict)



@app.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    resp = await oauth.google.authorize_redirect(request, redirect_uri)
    # acc_token = request.session.get("user", {}).get("access_token")
    user = request.session.get("user", None)
    if user:
        email = user.pop("email")
        db = startup_vars.get("db", None)
        if not db:
            # TODO: implement logger mechanism
            print(colored("Mongo Client not initialized", "red"))
        else:
            if not db.check_record_exists(email, collection_name = "user_data"):
                operation_flag = db.update_record(
                    data = {
                        "email": email,
                        "info": user
                        }, collection_name = "user_data")
        if email:
            resp.set_cookie(key="access_token", value=signJWT(email), domain=request.client.host)
    return resp



@app.get('/auth')
async def auth(request: Request, response: Response):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        return HTMLResponse(f'<h1>{error.error}</h1>')
    user = token.get('userinfo')
    # user["access_token"] = token.get("access_token")
    if user:
        request.session['user'] = dict(user)
    return RedirectResponse(url='/')



@app.get('/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')

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
