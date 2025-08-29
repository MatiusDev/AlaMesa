from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Relationship

class Reservation(SQLModel, table=True):
    """Modelo para la tabla Reservations."""
    __tablename__ = "reservations"

    reservation_id: UUID | None = Field(default_factory=uuid4, primary_key=True)
    restaurant_id: UUID = Field(foreign_key="restaurants.restaurant_id")
    diner_id: UUID = Field(foreign_key="diners.diner_id")
    reservation_time: datetime
    party_size: int
    status: str
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default_factory=datetime.utcnow)

    # Relaciones
    restaurant: "Restaurant" = Relationship(back_populates="reservations")
    diner: "Diner" = Relationship(back_populates="reservations")
