from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from core.services.reservation_service import SReservationService
from core.domain.schemas.reservation_schema import ReservationCreate, ReservationRead

router = APIRouter()

@router.post("/", response_model=ReservationRead, status_code=status.HTTP_201_CREATED, summary="Crear una nueva reserva")
async def create_reservation(reservation_data: ReservationCreate, service: SReservationService):
    return await service.create_reservation(reservation_data)

@router.get("/", response_model=List[ReservationRead], summary="Obtener todas las reservas")
async def get_all_reservations(service: SReservationService):
    return await service.get_all_reservations()

@router.get("/{reservation_id}", response_model=ReservationRead, summary="Obtener una reserva por su ID")
async def get_reservation_by_id(reservation_id: UUID, service: SReservationService):
    reservation = await service.get_reservation_by_id(reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")
    return reservation
