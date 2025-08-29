from uuid import UUID
from typing import List, Optional, Annotated

from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from core.domain.models.reservation import Reservation
from core.domain.schemas.reservation_schema import ReservationCreate, ReservationRead
from core.database.connection import SSession
from .restaurant_service import SRestaurantService
from .diner_service import SDinerService

class ReservationService:
    def __init__(self, session: SSession, restaurant_service: SRestaurantService, diner_service: SDinerService):
        self.session = session
        self.restaurant_service = restaurant_service
        self.diner_service = diner_service

    async def get_all_reservations(self) -> List[ReservationRead]:
        reservations = (await self.session.exec(select(Reservation))).all()
        return [ReservationRead.model_validate(r) for r in reservations]

    async def get_reservation_by_id(self, reservation_id: UUID) -> Optional[ReservationRead]:
        reservation = (await self.session.exec(select(Reservation).where(Reservation.reservation_id == reservation_id))).first()
        if reservation:
            return ReservationRead.model_validate(reservation)
        return None

    async def create_reservation(self, reservation_data: ReservationCreate) -> ReservationRead:
        # Verificar que el restaurant_id exista
        restaurant = await self.restaurant_service.get_restaurant_by_id(reservation_data.restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Verificar que el diner_id exista
        diner = await self.diner_service.get_diner_by_id(reservation_data.diner_id)
        if not diner:
            raise HTTPException(status_code=404, detail="Diner not found")

        reservation_to_create = Reservation.model_validate(reservation_data)
        
        self.session.add(reservation_to_create)
        await self.session.commit()
        await self.session.refresh(reservation_to_create)
        return ReservationRead.model_validate(reservation_to_create)

SReservationService = Annotated[ReservationService, Depends(ReservationService)]
