from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from core.services.review_service import SReviewService
from core.domain.schemas import ReviewCreate, ReviewRead

router = APIRouter()

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED, summary="Crear una nueva reseña")
async def create_review(review_data: ReviewCreate, service: SReviewService):
    return await service.create_review(review_data)

@router.get("/", response_model=List[ReviewRead], summary="Obtener todas las reseñas")
async def get_all_reviews(service: SReviewService):
    return await service.get_all_reviews()

@router.get("/{review_id}", response_model=ReviewRead, summary="Obtener una reseña por su ID")
async def get_review_by_id(review_id: UUID, service: SReviewService):
    review = await service.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada")
    return review
