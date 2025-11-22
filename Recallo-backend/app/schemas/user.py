from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None

# Properties to receive on user update
class UserUpdate(UserBase):
    pass

# Properties to return to client
class User(UserBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
