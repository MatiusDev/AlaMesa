from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from core.services.diner_service import SDinerService
from core.domain.schemas.diner_schema import DinerCreate, DinerRead

router = APIRouter()

@router.post("/", response_model=DinerRead, status_code=status.HTTP_201_CREATED, summary="Crear un nuevo comensal")
async def create_diner(diner_data: DinerCreate, service: SDinerService):
    return await service.create_diner(diner_data)

@router.get("/", response_model=List[DinerRead], summary="Obtener todos los comensales")
async def get_all_diners(service: SDinerService):
    return await service.get_all_diners()

@router.get("/{diner_id}", response_model=DinerRead, summary="Obtener un comensal por su ID")
async def get_diner_by_id(diner_id: UUID, service: SDinerService):
    diner = await service.get_diner_by_id(diner_id)
    if not diner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comensal no encontrado")
    return diner
