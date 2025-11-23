from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ContentBase(BaseModel):
    content: Optional[str] = None
    topic: Optional[str] = None

class ContentCreate(ContentBase):
    topic: str
    content: str

class BulkContentCreate(BaseModel):
    user_friend_event_id: int
    topics: list[ContentCreate]

class ContentUpdate(BaseModel):
    content: Optional[str] = None
    topic: Optional[str] = None
    user_friend_event_id: Optional[int] = None

class Content(ContentBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
