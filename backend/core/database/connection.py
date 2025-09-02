import os
from typing import AsyncGenerator, Annotated

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import Depends

# Importar todos los modelos para que se registren en SQLModel.metadata
from core.domain.models import *

# Construir la URL de la base de datos a partir de las variables de entorno
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_NAME = os.getenv("POSTGRES_DB")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Crear el motor de la base de datos asíncrono
engine = create_async_engine(DATABASE_URL, echo=True)

# Función para crear las tablas en la base de datos
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Base de datos inicializada correctamente")

# Dependencia para obtener una sesión de base de datos asíncrona
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session

# Tipo anotado para la inyección de dependencia de la sesión
SSession = Annotated[AsyncSession, Depends(get_session)]
