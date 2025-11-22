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
    return response.data[0]

@router.get("/user/{user_id}", response_model=List[schemas.Event])
def read_user_events(user_id: UUID):
    # 1. Get all (event_id, friend_id) pairs for this user from user_friends_events
    ufe_response = supabase.table("user_friends_events").select("event_id, friend_id").eq("user_id", str(user_id)).execute()
    user_events_data = ufe_response.data
    
    if not user_events_data:
        return []
        
    # Group friend_ids by event_id
    event_friends_map = {}
    for item in user_events_data:
        event_id = item['event_id']
        friend_id = item['friend_id']
        if event_id not in event_friends_map:
            event_friends_map[event_id] = []
        event_friends_map[event_id].append(friend_id)
        
    event_ids = list(event_friends_map.keys())
    
    # 2. Fetch event details
    events_response = supabase.table("events").select("*").in_("id", event_ids).order("event_date", desc=True).execute()
    events = events_response.data
    
    # 3. For each event, fetch friend names
    for event in events:
        friend_ids = event_friends_map.get(event['id'], [])
        if friend_ids:
            friends_response = supabase.table("friends").select("friend_name").in_("id", friend_ids).execute()
            event['friend_names'] = [f['friend_name'] for f in friends_response.data]
        else:
            event['friend_names'] = []
            
    return events

@router.get("/user/{user_id}/friend/{friend_id}", response_model=List[schemas.Event])
def read_user_friend_events(user_id: UUID, friend_id: UUID):
    # 1. Get all event_ids for this user AND friend from user_friends_events
    ufe_response = supabase.table("user_friends_events").select("event_id").eq("user_id", str(user_id)).eq("friend_id", str(friend_id)).execute()
    user_friend_events_data = ufe_response.data
    
    if not user_friend_events_data:
        return []
        
    event_ids = [item['event_id'] for item in user_friend_events_data]
    
    # 2. Fetch event details
    events_response = supabase.table("events").select("*").in_("id", event_ids).order("event_date", desc=True).execute()
    events = events_response.data
    
    # 3. For each event, fetch friend names (optional, but good for consistency if we reuse the card)
    # Since we are on a specific person's page, maybe we don't strictly need ALL names, 
    # but if the UI shows "with X, Y, Z", we should fetch them.
    # Let's reuse the logic to fetch friend names for these events.
    
    # We need to know all friends for these events to list them.
    # So we query user_friends_events again for these event_ids (and this user_id)
    
    ufe_all_response = supabase.table("user_friends_events").select("event_id, friend_id").eq("user_id", str(user_id)).in_("event_id", event_ids).execute()
    all_events_data = ufe_all_response.data
    
    event_friends_map = {}
    for item in all_events_data:
        eid = item['event_id']
        fid = item['friend_id']
        if eid not in event_friends_map:
            event_friends_map[eid] = []
        event_friends_map[eid].append(fid)
        
    for event in events:
        friend_ids = event_friends_map.get(event['id'], [])
        if friend_ids:
            friends_response = supabase.table("friends").select("friend_name").in_("id", friend_ids).execute()
            event['friend_names'] = [f['friend_name'] for f in friends_response.data]
        else:
            event['friend_names'] = []
            
    return events
