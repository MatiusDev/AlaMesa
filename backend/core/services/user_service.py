from uuid import UUID
from typing import List, Optional, Annotated
import hashlib

from fastapi import Depends
from sqlmodel import Session, select

from core.domain.models.user import User
from core.domain.schemas.user_schema import UserCreate, UserRead
from core.database.connection import SSession

class UserService:
    def __init__(self, session: SSession):
        self.session = session

    async def get_all_users(self) -> List[UserRead]:
        users = (await self.session.exec(select(User))).all()
        return [UserRead.model_validate(u) for u in users]

    async def get_user_by_id(self, user_id: UUID) -> Optional[UserRead]:
        user = (await self.session.exec(select(User).where(User.user_id == user_id))).first()
        if user:
            return UserRead.model_validate(user)
        return None

    async def create_user(self, user_data: UserCreate) -> UserRead:
        password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
        
        user_to_create = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=password_hash
        )
        
        self.session.add(user_to_create)
        await self.session.commit()
        await self.session.refresh(user_to_create)
        return UserRead.model_validate(user_to_create)

SUserService = Annotated[UserService, Depends(UserService)]
