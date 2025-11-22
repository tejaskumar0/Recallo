from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app import schemas
from app.core.supabase import supabase

router = APIRouter()

@router.post("/", response_model=schemas.Event)
def create_event(event: schemas.EventCreate):
    # Convert date to ISO format string if present
    event_data = event.model_dump()
    if event_data.get('event_date'):
        event_data['event_date'] = event_data['event_date'].isoformat()
        
    response = supabase.table("events").insert(event_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Event could not be created")
    return response.data[0]

@router.get("/", response_model=List[schemas.Event])
def read_events(skip: int = 0, limit: int = 100):
    response = supabase.table("events").select("*").range(skip, skip + limit - 1).execute()
    return response.data

@router.get("/{event_id}", response_model=schemas.Event)
def read_event(event_id: UUID):
    response = supabase.table("events").select("*").eq("id", str(event_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return response.data[0]

@router.put("/{event_id}", response_model=schemas.Event)
def update_event(event_id: UUID, event_in: schemas.EventUpdate):
    update_data = event_in.model_dump(exclude_unset=True)
    if update_data.get('event_date'):
        update_data['event_date'] = update_data['event_date'].isoformat()
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
        
    response = supabase.table("events").update(update_data).eq("id", str(event_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return response.data[0]

@router.delete("/{event_id}", response_model=schemas.Event)
def delete_event(event_id: UUID):
    response = supabase.table("events").delete().eq("id", str(event_id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return response.data[0]
