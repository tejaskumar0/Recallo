from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app import schemas
from app.core.supabase import supabase

router = APIRouter()

@router.post("/", response_model=schemas.Friend)
def create_friend(friend: schemas.FriendCreate):
    response = supabase.table("friends").insert(friend.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Friend could not be created")
    return response.data[0]

@router.get("/", response_model=List[schemas.Friend])
def read_friends(skip: int = 0, limit: int = 100):
    response = supabase.table("friends").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{friend_id}", response_model=schemas.Friend)
def read_friend(friend_id: UUID):
    response = supabase.table("friends").select("*").eq("id", str(friend_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Friend not found")
    return response.data[0]

@router.put("/{friend_id}", response_model=schemas.Friend)
def update_friend(friend_id: UUID, friend_in: schemas.FriendUpdate):
    update_data = friend_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
    response = supabase.table("friends").update(update_data).eq("id", str(friend_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Friend not found")
    return response.data[0]

@router.delete("/{friend_id}", response_model=schemas.Friend)
def delete_friend(friend_id: UUID):
    response = supabase.table("friends").delete().eq("id", str(friend_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Friend not found")
    return response.data[0]
