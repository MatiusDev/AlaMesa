from uuid import UUID
from typing import List, Optional

from core.domain.models import Reservation
from core.domain.schemas.reservation_schema import ReservationCreate, ReservationRead

class ReservationService:
    async def get_all_reservations(self) -> List[ReservationRead]:
        reservations = await Reservation.find_all()
        return [ReservationRead.from_orm(r) for r in reservations]

    async def get_reservation_by_id(self, reservation_id: UUID) -> Optional[ReservationRead]:
        reservation = await Reservation.find_one(reservation_id)
        if reservation:
            return ReservationRead.from_orm(reservation)
        return None

    async def create_reservation(self, reservation_data: ReservationCreate) -> ReservationRead:
        new_reservation = await Reservation.create(**reservation_data.dict())
        return ReservationRead.from_orm(new_reservation)
