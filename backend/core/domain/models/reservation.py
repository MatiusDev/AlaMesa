from typing import Optional
from pydantic import Field, PrivateAttr
from uuid import UUID
from datetime import datetime

from core.database.base_model import CustomBaseModel

class Reservation(CustomBaseModel):
    """Modelo para la tabla Reservations."""
    _table_name = PrivateAttr("reservations")
    _primary_key = PrivateAttr("reservation_id")

    reservation_id: Optional[UUID] = Field(default=None, alias='id')
    restaurant_id: UUID
    diner_id: UUID
    reservation_time: datetime
    party_size: int
    status: str
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        validate_by_name = True
