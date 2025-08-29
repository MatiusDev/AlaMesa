from typing import List
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Relationship

class Owner(SQLModel, table=True):
    """Modelo para la tabla Owners."""
    __tablename__ = "owners"

    owner_id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.user_id")
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relación con el modelo User
    user: "User" = Relationship(back_populates="owner")
    restaurants: list["Restaurant"] = Relationship(back_populates="owner")
