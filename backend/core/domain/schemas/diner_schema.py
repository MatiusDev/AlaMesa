from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class DinerCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class DinerRead(BaseModel):
    diner_id: UUID
    user_id: UUID
    username: str
    email: EmailStr
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
