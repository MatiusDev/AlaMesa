from uuid import UUID
from typing import List, Optional, Annotated

from fastapi import Depends
from sqlmodel import Session, select

from core.domain.models.restaurant import Restaurant
from core.domain.schemas.restaurant_schema import RestaurantCreate, RestaurantRead
from core.database.connection import SSession
from .owner_service import SOwnerService

class RestaurantService:
    def __init__(self, session: SSession, owner_service: SOwnerService):
        self.session = session
        self.owner_service = owner_service

    async def get_all_restaurants(self) -> List[RestaurantRead]:
        restaurants = (await self.session.exec(select(Restaurant))).all()
        return [RestaurantRead.model_validate(r) for r in restaurants]

    async def get_restaurant_by_id(self, restaurant_id: UUID) -> Optional[RestaurantRead]:
        restaurant = (await self.session.exec(select(Restaurant).where(Restaurant.restaurant_id == restaurant_id))).first()
        if restaurant:
            return RestaurantRead.model_validate(restaurant)
        return None

    async def create_restaurant(self, restaurant_data: RestaurantCreate) -> RestaurantRead:
        # Verificar que el owner_id exista
        owner = await self.owner_service.get_owner_by_id(restaurant_data.owner_id)
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")

        restaurant_to_create = Restaurant.model_validate(restaurant_data)
        
        self.session.add(restaurant_to_create)
        await self.session.commit()
        await self.session.refresh(restaurant_to_create)
        return RestaurantRead.model_validate(restaurant_to_create)

SRestaurantService = Annotated[RestaurantService, Depends(RestaurantService)]
