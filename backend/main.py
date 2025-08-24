import os
import uvicorn
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Cargar variables de entorno desde el .env en la raíz del proyecto
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from core.router import routes as api_routes
from core.database.connection import init_db
from core.database.mongodb_driver import init_mongodb

from core.router import routes as api_routes

from core.router import routes as api_routes

from core.router import routes as api_routes

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()
    await init_mongodb()

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