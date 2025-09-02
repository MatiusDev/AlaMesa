from uuid import UUID
from typing import List, Optional, Annotated
import hashlib

from fastapi import Depends
from sqlmodel import Session, select

from core.domain.models.diner import Diner
from core.domain.models.user import User
from core.domain.schemas.diner_schema import DinerCreate, DinerRead
from core.database.connection import SSession
from .user_service import SUserService

class DinerService:
    def __init__(self, session: SSession, user_service: SUserService):
        self.session = session
        self.user_service = user_service

    async def get_all_diners(self) -> List[DinerRead]:
        diners = (await self.session.exec(select(Diner))).all()
        diners_read = []
        for diner in diners:
            user = await self.user_service.get_user_by_id(diner.user_id)
            if user:
                combined_data = {**diner.model_dump(), **user.model_dump()}
                diners_read.append(DinerRead(**combined_data))
        return diners_read

    async def get_diner_by_id(self, diner_id: UUID) -> Optional[DinerRead]:
        diner = (await self.session.exec(select(Diner).where(Diner.diner_id == diner_id))).first()
        if not diner:
            return None
            
        user = await self.user_service.get_user_by_id(diner.user_id)
        if not user:
            return None
            
        combined_data = {**diner.model_dump(), **user.model_dump()}
        return DinerRead(**combined_data)

    async def create_diner(self, diner_data: DinerCreate) -> DinerRead:
        created_user = await self.user_service.create_user(user_data=diner_data)

        diner_to_create = Diner(user_id=created_user.user_id)
        
        self.session.add(diner_to_create)
        await self.session.commit()
        await self.session.refresh(diner_to_create)

        combined_data = {
            **created_user.model_dump(),
            **diner_to_create.model_dump()
        }
        return DinerRead(**combined_data)

SDinerService = Annotated[DinerService, Depends(DinerService)]
