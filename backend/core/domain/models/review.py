from typing import List
from uuid import UUID, uuid4
from datetime import datetime, date
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column
from sqlalchemy.sql.sqltypes import TIMESTAMP

class Review(SQLModel, table=True):
    """Modelo para la tabla Reviews."""
    __tablename__ = "reviews"

    review_id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    restaurant_id: UUID = Field(foreign_key="restaurants.restaurant_id")
    diner_id: UUID | None = Field(default=None, foreign_key="diners.diner_id")
    source: str
    rating: float
    comment: str | None = None
    review_date: date
    created_at: datetime | None = Field(default_factory=datetime.utcnow, sa_column=Column(TIMESTAMP(timezone=True)))
    updated_at: datetime | None = Field(default_factory=datetime.utcnow, sa_column=Column(TIMESTAMP(timezone=True)))

    # Relaciones
    restaurant: "Restaurant" = Relationship(back_populates="reviews")
    diner: "Diner" = Relationship(back_populates="reviews")
