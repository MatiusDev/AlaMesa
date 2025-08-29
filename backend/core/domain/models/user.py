from typing import List
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    """Modelo para la tabla Users."""
    __tablename__ = "users"

    user_id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(unique=True)
    email: str = Field(unique=True)
    password_hash: str
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    owner: "Owner" = Relationship(back_populates="user")
    diner: "Diner" = Relationship(back_populates="user")
