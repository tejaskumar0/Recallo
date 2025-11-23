from fastapi import APIRouter, HTTPException
from typing import List

from app import schemas
from app.core.supabase import supabase
from uuid import UUID

router = APIRouter()

# User Friends
@router.post("/user-friends/", response_model=schemas.UserFriend)
def create_user_friend(relation: schemas.UserFriendCreate):
    # Convert Pydantic model to a dictionary
    relation_data = relation.model_dump()
    
    # Check and convert UUID objects to strings for JSON serialization
    for key, value in relation_data.items():
        if isinstance(value, UUID):
            relation_data[key] = str(value)
            
    # Now insert the dictionary with string UUIDs
    response = supabase.table("user_friends").insert(relation_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Relation could not be created")
    return response.data[0]

@router.get("/user-friends/", response_model=List[schemas.UserFriend])
def read_user_friends(skip: int = 0, limit: int = 100):
    response = supabase.table("user_friends").select("*").range(skip, skip + limit - 1).execute()
    return response.data

# User Events
@router.post("/user-events/", response_model=schemas.UserEvent)
def create_user_event(relation: schemas.UserEventCreate):

    # Convert Pydantic model to a dictionary
    relation_data = relation.model_dump()
    
    # Check and convert UUID objects to strings for JSON serialization
    for key, value in relation_data.items():
        if isinstance(value, UUID):
            relation_data[key] = str(value)
            
    # Now insert the dictionary with string UUIDs
    response = supabase.table("user_events").insert(relation_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Relation could not be created")
    return response.data[0]

@router.get("/user-events/", response_model=List[schemas.UserEvent])
def read_user_events(skip: int = 0, limit: int = 100):
    response = supabase.table("user_events").select("*").range(skip, skip + limit - 1).execute()
    return response.data

# User Friends Events
@router.post("/user-friends-events/", response_model=schemas.UserFriendsEvent)
def create_user_friends_event(relation: schemas.UserFriendsEventCreate):
    response = supabase.table("user_friends_events").insert(relation.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Relation could not be created")
    return response.data[0]

@router.get("/user-friends-events/", response_model=List[schemas.UserFriendsEvent])
def read_user_friends_events(skip: int = 0, limit: int = 100):
    response = supabase.table("user_friends_events").select("*").range(skip, skip + limit - 1).execute()
    return response.data
