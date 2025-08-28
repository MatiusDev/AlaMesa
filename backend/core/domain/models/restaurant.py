from typing import List, Optional, Any
from pydantic import Field, PrivateAttr
from uuid import UUID
from datetime import datetime

from core.database.base_model import CustomBaseModel

class Restaurant(CustomBaseModel):
    """Modelo para la tabla Restaurants."""
    _table_name = PrivateAttr("restaurants")
    _primary_key = PrivateAttr("restaurant_id")

    restaurant_id: Optional[UUID] = Field(default=None, alias='id')
    owner_id: UUID
    name: str
    restaurant_type: List[str]
    price_range: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    menu_url: Optional[str] = None
    phone: str
    email: str
    website: Optional[str] = None
    full_address: str
    street: Optional[str] = None
    city: str
    state: str
    opening_hours: Optional[Any] = None # JSONB
    features: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        validate_by_name = True