from typing import Any
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.sql.sqltypes import TIMESTAMP

class Restaurant(SQLModel, table=True):
    """Modelo para la tabla Restaurants."""
    __tablename__ = "restaurants"

    restaurant_id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    owner_id: UUID = Field(foreign_key="owners.owner_id")
    name: str = Field(unique=True)
    restaurant_type: list[str] = Field(sa_column=Column(ARRAY(String)))
    price_range: str | None = None
    rating: float | None = None
    reviews_count: int | None = None
    menu_url: str | None = None
    images: list[str] | None = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    phone: str
    email: str
    website: str | None = None
    full_address: str
    street: str | None = None
    city: str
    state: str
    opening_hours: Any | None = Field(default=None, sa_column=Column(JSONB)) # JSONB
    features: list[str] | None = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    created_at: datetime | None = Field(default_factory=datetime.utcnow, sa_column=Column(TIMESTAMP(timezone=True)))
    updated_at: datetime | None = Field(default_factory=datetime.utcnow, sa_column=Column(TIMESTAMP(timezone=True)))

    # Relación con el modelo Owner
    owner: "Owner" = Relationship(back_populates="restaurants")
    reviews: list["Review"] = Relationship(back_populates="restaurant")
    reservations: list["Reservation"] = Relationship(back_populates="restaurant")