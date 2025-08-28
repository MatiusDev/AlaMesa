from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ReservationCreate(BaseModel):
    restaurant_id: UUID
    diner_id: UUID
    reservation_time: datetime
    party_size: int
    status: str

class ReservationRead(BaseModel):
    reservation_id: UUID
    restaurant_id: UUID
    diner_id: UUID
    reservation_time: datetime
    party_size: int
    status: str
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True
