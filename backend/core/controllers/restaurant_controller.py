from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from core.services import RestaurantService
from core.domain.schemas import RestaurantCreate, RestaurantRead

# Se crea un router específico para el controlador de restaurantes
router = APIRouter()

# Inyección de dependencias del servicio
def get_restaurant_service() -> RestaurantService:
    return RestaurantService()

@router.post("/", 
             response_model=RestaurantRead, 
             status_code=status.HTTP_201_CREATED, 
             summary="Crear un nuevo restaurante")
async def create_restaurant(restaurant_data: RestaurantCreate, 
                          service: RestaurantService = Depends(get_restaurant_service)):
    """
    Crea un nuevo restaurante en la base de datos.
    """
    return await service.create_restaurant(restaurant_data)

@router.get("/", 
            response_model=List[RestaurantRead], 
            summary="Obtener todos los restaurantes")
async def get_all_restaurants(service: RestaurantService = Depends(get_restaurant_service)):
    """
    Retorna una lista de todos los restaurantes.
    """
    return await service.get_all_restaurants()

@router.get("/{restaurant_id}", 
            response_model=RestaurantRead, 
            summary="Obtener un restaurante por su ID")
async def get_restaurant_by_id(restaurant_id: UUID, 
                             service: RestaurantService = Depends(get_restaurant_service)):
    """
    Retorna un restaurante específico basado en su UUID.
    """
    restaurant = await service.get_restaurant_by_id(restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Restaurante no encontrado")
    return restaurant
