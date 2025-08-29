from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column
from sqlalchemy.sql.sqltypes import TIMESTAMP

class Diner(SQLModel, table=True):
    """Modelo para la tabla Diners."""
    __tablename__ = "diners"

    diner_id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.user_id")
    created_at: datetime | None = Field(default_factory=datetime.utcnow, sa_column=Column(TIMESTAMP(timezone=True)))
    updated_at: datetime | None = Field(default_factory=datetime.utcnow, sa_column=Column(TIMESTAMP(timezone=True)))

    # Relación con el modelo User
    user: "User" = Relationship(back_populates="diner")
    reviews: list["Review"] = Relationship(back_populates="diner")
    reservations: list["Reservation"] = Relationship(back_populates="diner")
