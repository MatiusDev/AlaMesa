from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from core.services.owner_service import SOwnerService
from core.domain.schemas.owner_schema import OwnerCreate, OwnerRead

router = APIRouter()

@router.post("/", response_model=OwnerRead, status_code=status.HTTP_201_CREATED, summary="Crear un nuevo propietario")
async def create_owner(owner_data: OwnerCreate, service: SOwnerService):
    # print('here')
    return await service.create_owner(owner_data)

@router.get("/", response_model=List[OwnerRead], summary="Obtener todos los propietarios")
async def get_all_owners(service: SOwnerService):
    return await service.get_all_owners()

@router.get("/{owner_id}", response_model=OwnerRead, summary="Obtener un propietario por su ID")
async def get_owner_by_id(owner_id: UUID, service: SOwnerService):
    owner = await service.get_owner_by_id(owner_id)
    if not owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Propietario no encontrado")
    return owner
