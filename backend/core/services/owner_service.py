from uuid import UUID
from typing import List, Optional, Annotated
import hashlib
from datetime import datetime

from fastapi import Depends
from sqlmodel import Session, select

from core.domain.models.owner import Owner
from core.domain.models.user import User
from core.domain.schemas.owner_schema import OwnerCreate, OwnerRead
from core.database.connection import SSession
from .user_service import SUserService

class OwnerService:
    def __init__(self, session: SSession, user_service: SUserService):
        self.session = session
        self.user_service = user_service

    async def get_all_owners(self) -> List[OwnerRead]:
        owners = (await self.session.exec(select(Owner))).all()
        owners_read = []
        for owner in owners:
            user = await self.user_service.get_user_by_id(owner.user_id)
            if user:
                combined_data = {**owner.model_dump(), **user.model_dump()}
                owners_read.append(OwnerRead(**combined_data))
        return owners_read

    async def get_owner_by_id(self, owner_id: UUID) -> Optional[OwnerRead]:
        owner = (await self.session.exec(select(Owner).where(Owner.owner_id == owner_id))).first()
        if not owner:
            return None
        
        user = await self.user_service.get_user_by_id(owner.user_id)
        if not user:
            return None
            
        combined_data = {**owner.model_dump(), **user.model_dump()}
        return OwnerRead(**combined_data)

    async def create_owner(self, owner_data: OwnerCreate) -> OwnerRead:
        created_user = await self.user_service.create_user(user_data=owner_data) # Reutilizar el servicio de usuario

        # Crear el owner con timestamps explícitos
        current_time = datetime.utcnow()
        owner_to_create = Owner(
            user_id=created_user.user_id,
            created_at=current_time,
            updated_at=current_time
        )
        
        self.session.add(owner_to_create)
        await self.session.commit()
        await self.session.refresh(owner_to_create)

        combined_data = {
            **created_user.model_dump(),
            **owner_to_create.model_dump()
        }
        return OwnerRead(**combined_data)

SOwnerService = Annotated[OwnerService, Depends(OwnerService)]
