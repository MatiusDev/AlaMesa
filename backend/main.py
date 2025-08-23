import os
import uvicorn

from fastapi import FastAPI
from dotenv import load_dotenv

from core.router import routes as api_routes

load_dotenv()

app = FastAPI()

app.include_router(api_routes, prefix="/api")

def run():
    ENVIRONTMENT = os.getenv("ENVIRONTMENT", "dev")
    SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))
    
    if ENVIRONTMENT == "dev":
        SERVER_HOST = os.getenv("SERVER_HOST", "localhost")
        reload = True
        log_level = "debug"
    else:
        SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
        reload = False
        log_level = "info"


    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=reload, log_level=log_level)
    
if __name__ == "__main__":
    run()