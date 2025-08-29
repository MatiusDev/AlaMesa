from typing import List, Optional, Dict, Any
from pydantic import PrivateAttr

from core.database.base_model import CustomBaseModel

class Restaurant(CustomBaseModel):
    """Modelo para un Restaurante, usando nuestro ORM."""
    _table_name = PrivateAttr("restaurants")

    name: str
    restaurant_type: List[str]
    price_range: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    address: Dict[str, Any]
    contact: Dict[str, Any]
    hours: List[Dict[str, Any]]
    menu_url: Optional[str] = None
    features: List[str]
    image_urls: List[str]
    source_site: str
