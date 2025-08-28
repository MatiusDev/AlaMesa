from uuid import UUID
from typing import List, Optional

from core.domain.models import Review
from core.domain.schemas.review_schema import ReviewCreate, ReviewRead

class ReviewService:
    async def get_all_reviews(self) -> List[ReviewRead]:
        reviews = await Review.find_all()
        return [ReviewRead.from_orm(r) for r in reviews]

    async def get_review_by_id(self, review_id: UUID) -> Optional[ReviewRead]:
        review = await Review.find_one(review_id)
        if review:
            return ReviewRead.from_orm(review)
        return None

    async def create_review(self, review_data: ReviewCreate) -> ReviewRead:
        new_review = await Review.create(**review_data.dict())
        return ReviewRead.from_orm(new_review)
