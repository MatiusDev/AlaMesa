from uuid import UUID
from typing import List, Optional

from core.domain.models import Restaurant
from core.domain.schemas.restaurant_schema import RestaurantCreate, RestaurantRead

class RestaurantService:
    async def get_all_restaurants(self) -> List[RestaurantRead]:
        restaurants = await Restaurant.find_all()
        return [RestaurantRead.from_orm(r) for r in restaurants]

    async def get_restaurant_by_id(self, restaurant_id: UUID) -> Optional[RestaurantRead]:
        restaurant = await Restaurant.find_one(restaurant_id)
        if restaurant:
            return RestaurantRead.from_orm(restaurant)
        return None

    async def create_restaurant(self, restaurant_data: RestaurantCreate) -> RestaurantRead:
        # Aquí iría la lógica de negocio, validaciones, etc.
        new_restaurant = await Restaurant.create(**restaurant_data.dict())
        return RestaurantRead.from_orm(new_restaurant)
