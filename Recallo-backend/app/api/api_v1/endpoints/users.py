from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app import schemas
from app.core.supabase import supabase

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100):
    """
    Retrieve users (profiles).
    """
    response = supabase.table("users").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: UUID):
    """
    Get a specific user profile.
    """
    response = supabase.table("users").select("*").eq("id", str(user_id)).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
        
    return response.data[0]

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: UUID, user_in: schemas.UserUpdate):
    """
    Update a user profile.
    """
    # Filter out None values so we don't overwrite with null
    update_data = user_in.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")

    response = supabase.table("users").update(update_data).eq("id", str(user_id)).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
        
    return response.data[0]
