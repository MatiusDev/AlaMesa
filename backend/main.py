import os
import uvicorn
from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv

# Cargar variables de entorno desde el .env en la raíz del proyecto
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from core.router import routes as api_routes
from core.database.connection import init_db

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(api_routes, prefix="/api")

def run():
    ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
    SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))
    
    if ENVIRONMENT == "dev":
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