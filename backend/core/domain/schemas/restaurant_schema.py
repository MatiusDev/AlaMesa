from pydantic import BaseModel
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

# DTO for creating a restaurant (input)
class RestaurantCreate(BaseModel):
    owner_id: UUID
    name: str
    restaurant_type: List[str]
    price_range: Optional[str] = None
    phone: str
    email: str
    website: Optional[str] = None
    full_address: str
    street: Optional[str] = None
    city: str
    state: str
    opening_hours: Optional[Any] = None # JSONB
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None

# DTO for reading a restaurant (output)
class RestaurantRead(BaseModel):
    restaurant_id: UUID
    owner_id: UUID
    name: str
    restaurant_type: List[str]
    price_range: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    menu_url: Optional[str] = None
    images: Optional[List[str]] = None
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
