from uuid import UUID
from typing import List, Optional, Annotated

from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from core.domain.models import Review
from core.domain.schemas import ReviewCreate, ReviewRead
from core.database.connection import SSession
from .restaurant_service import SRestaurantService
from .diner_service import SDinerService

class ReviewService:
    def __init__(self, session: SSession, restaurant_service: SRestaurantService, diner_service: SDinerService):
        self.session = session
        self.restaurant_service = restaurant_service
        self.diner_service = diner_service

    async def get_all_reviews(self) -> List[ReviewRead]:
        reviews = await self.session.exec(select(Review)).all()
        return [ReviewRead.model_validate(r) for r in reviews]

    async def get_review_by_id(self, review_id: UUID) -> Optional[ReviewRead]:
        review = await self.session.exec(select(Review).where(Review.review_id == review_id)).first()
        if review:
            return ReviewRead.model_validate(review)
        return None

    async def create_review(self, review_data: ReviewCreate) -> ReviewRead:
        # Verificar que el restaurant_id exista
        restaurant = await self.restaurant_service.get_restaurant_by_id(review_data.restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Verificar que el diner_id exista si no es nulo
        if review_data.diner_id:
            diner = await self.diner_service.get_diner_by_id(review_data.diner_id)
            if not diner:
                raise HTTPException(status_code=404, detail="Diner not found")

        review_to_create = Review.model_validate(review_data)
        
        self.session.add(review_to_create)
        await self.session.commit()
        await self.session.refresh(review_to_create)
        return ReviewRead.model_validate(review_to_create)

SReviewService = Annotated[ReviewService, Depends(ReviewService)]
