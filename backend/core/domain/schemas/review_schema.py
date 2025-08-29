from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class ReviewCreate(BaseModel):
    restaurant_id: UUID
    diner_id: Optional[UUID] = None
    source: str
    rating: float
    comment: Optional[str] = None
    review_date: date

class ReviewRead(BaseModel):
    review_id: UUID
    restaurant_id: UUID
    diner_id: Optional[UUID] = None
    source: str
    rating: float
    comment: Optional[str] = None
    review_date: date
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
