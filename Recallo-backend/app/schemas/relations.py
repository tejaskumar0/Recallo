from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

# User Events
class UserEventBase(BaseModel):
    user_id: UUID
    event_id: UUID

class UserEventCreate(UserEventBase):
    pass

class UserEvent(UserEventBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

# User Friends
class UserFriendBase(BaseModel):
    user_id: UUID
    friend_id: UUID
    username: Optional[str] = None
    friendname: Optional[str] = None

class UserFriendCreate(UserFriendBase):
    pass

class UserFriend(UserFriendBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}

# User Friends Events
class UserFriendsEventBase(BaseModel):
    user_id: UUID
    friend_id: UUID
    event_id: UUID

class UserFriendsEventCreate(UserFriendsEventBase):
    pass

class UserFriendsEvent(UserFriendsEventBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
