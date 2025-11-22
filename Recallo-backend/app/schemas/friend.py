from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class FriendBase(BaseModel):
    friend_name: str

class FriendCreate(FriendBase):
    pass

class FriendUpdate(BaseModel):
    friend_name: Optional[str] = None

class Friend(FriendBase):
    id: UUID
    created_at: datetime
    event_count: Optional[int] = 0
    last_event_date: Optional[datetime] = None

    model_config = {"from_attributes": True}
