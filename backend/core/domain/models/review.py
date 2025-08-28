from typing import Optional
from pydantic import Field, PrivateAttr
from uuid import UUID
from datetime import datetime, date

from core.database.base_model import CustomBaseModel

class Review(CustomBaseModel):
    """Modelo para la tabla Reviews."""
    _table_name = PrivateAttr("reviews")
    _primary_key = PrivateAttr("review_id")

    review_id: Optional[UUID] = Field(default=None, alias='id')
    restaurant_id: UUID
    diner_id: Optional[UUID] = None
    source: str
    rating: float
    comment: Optional[str] = None
    review_date: date
    created_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        validate_by_name = True
