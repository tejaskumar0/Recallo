from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from typing import Optional

class EventBase(BaseModel):
    event_name: str
    event_date: Optional[date] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    event_date: Optional[date] = None

class Event(EventBase):
    id: UUID
    created_at: datetime
    friend_names: Optional[list[str]] = []

    model_config = {"from_attributes": True}
