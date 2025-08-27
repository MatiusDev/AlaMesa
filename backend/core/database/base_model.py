from pydantic import BaseModel, Field, PrivateAttr
from typing import List, Optional, Type, TypeVar, Dict, Any

from .connection import Database

T = TypeVar("T", bound="CustomBaseModel")

class CustomBaseModel(BaseModel):
    """
    Clase base para todos los modelos del ORM.
    Hereda de Pydantic y añade métodos CRUD.
    """
    _table_name: str = PrivateAttr()
    id: Optional[int] = Field(default=None)

    class Config:
        orm_mode = True
        anystr_strip_whitespace = True

    @classmethod
    async def create(cls: Type[T], **kwargs) -> T:
        """Crea un nuevo registro en la base de datos."""
        pool = await Database.get_pool()
        model_data = cls(**kwargs)
        data_dict = model_data.dict(exclude={'id'}, exclude_none=True)

        columns = ", ".join(data_dict.keys())
        placeholders = ", ".join([f"${i+1}" for i in range(len(data_dict))])

        query = f"INSERT INTO {cls._table_name} ({columns}) VALUES ({placeholders}) RETURNING id"

        async with pool.acquire() as connection:
            new_id = await connection.fetchval(query, *data_dict.values())
            model_data.id = new_id
            return model_data

    @classmethod
    async def find_one(cls: Type[T], id: int) -> Optional[T]:
        """Busca un registro por su ID."""
        pool = await Database.get_pool()
        query = f"SELECT * FROM {cls._table_name} WHERE id = $1"
        async with pool.acquire() as connection:
            row = await connection.fetchrow(query, id)
            return cls(**row) if row else None

    async def save(self):
        """Actualiza un registro existente en la base de datos."""
        if self.id is None:
            raise ValueError("No se puede guardar un modelo sin ID. Use 'create' en su lugar.")

        pool = await Database.get_pool()
        data_dict = self.dict(exclude={'id'}, exclude_none=True)

        set_clause = ", ".join([f"{key} = ${i+1}" for i, key in enumerate(data_dict.keys())])
        query = f"UPDATE {cls._table_name} SET {set_clause} WHERE id = ${len(data_dict) + 1}"

        values = list(data_dict.values()) + [self.id]

        async with pool.acquire() as connection:
            await connection.execute(query, *values)

    async def delete(self):
        """Elimina un registro de la base de datos."""
        if self.id is None:
            raise ValueError("No se puede eliminar un modelo sin ID.")

        pool = await Database.get_pool()
        query = f"DELETE FROM {cls._table_name} WHERE id = $1"
        async with pool.acquire() as connection:
            await connection.execute(query, self.id)
        self.id = None
