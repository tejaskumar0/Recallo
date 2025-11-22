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
    # Fetch friends
    friends_response = supabase.table("friends").select("*").range(skip, skip + limit - 1).execute()
    friends = friends_response.data
    
    # For each friend, fetch their stats
    for friend in friends:
        # 1. Get all event_ids for this friend from user_friends_events
        ufe_response = supabase.table("user_friends_events").select("event_id, created_at").eq("friend_id", friend['id']).execute()
        events_linked = ufe_response.data
        
        # Set event count
        friend['event_count'] = len(events_linked)
        
        if events_linked:
            # 2. Find the latest event date
            event_ids = [e['event_id'] for e in events_linked]
            # Query events table for these IDs, order by date descending, take 1
            events_response = supabase.table("events").select("event_date").in_("id", event_ids).order("event_date", desc=True).limit(1).execute()
            
            if events_response.data:
                friend['last_event_date'] = events_response.data[0]['event_date']
            else:
                friend['last_event_date'] = None
        else:
            friend['last_event_date'] = None
            
    return friends

@router.get("/user/{user_id}", response_model=List[schemas.Friend])
def read_user_friends(user_id: UUID):
    # 1. Get all friend_ids for this user from user_friends
    uf_response = supabase.table("user_friends").select("friend_id").eq("user_id", str(user_id)).execute()
    user_friends_data = uf_response.data
    
    if not user_friends_data:
        return []
        
    friend_ids = [item['friend_id'] for item in user_friends_data]
    
    # 2. Fetch friend details
    friends_response = supabase.table("friends").select("*").in_("id", friend_ids).execute()
    friends = friends_response.data
    
    # 3. For each friend, fetch their stats
    for friend in friends:
        # Get all event_ids for this friend from user_friends_events
        ufe_response = supabase.table("user_friends_events").select("event_id, created_at").eq("friend_id", friend['id']).execute()
        events_linked = ufe_response.data
        
        # Set event count
        friend['event_count'] = len(events_linked)
        
        if events_linked:
            # Find the latest event date
            event_ids = [e['event_id'] for e in events_linked]
            # Query events table for these IDs, order by date descending, take 1
            events_response = supabase.table("events").select("event_date").in_("id", event_ids).order("event_date", desc=True).limit(1).execute()
            
            if events_response.data:
                friend['last_event_date'] = events_response.data[0]['event_date']
            else:
                friend['last_event_date'] = None
        else:
            friend['last_event_date'] = None
            
    return friends

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

@router.get("/user/{user_id}/event/{event_id}", response_model=List[schemas.Friend])
def read_user_event_friends(user_id: UUID, event_id: UUID):
    # 1. Get all friend_ids for this user AND event from user_friends_events
    ufe_response = supabase.table("user_friends_events").select("friend_id").eq("user_id", str(user_id)).eq("event_id", str(event_id)).execute()
    user_friend_events_data = ufe_response.data
    
    if not user_friend_events_data:
        return []
        
    friend_ids = [item['friend_id'] for item in user_friend_events_data]
    
    # 2. Fetch friend details
    friends_response = supabase.table("friends").select("*").in_("id", friend_ids).execute()
    friends = friends_response.data
    
    # 3. For each friend, calculate their event count and last event date
    for friend in friends:
        # Get all event_ids for this friend from user_friends_events
        ufe_friend_response = supabase.table("user_friends_events").select("event_id").eq("friend_id", friend['id']).execute()
        events_linked = ufe_friend_response.data
        
        # Set event count
        friend['event_count'] = len(events_linked)
        
        if events_linked:
            # Find the latest event date
            event_ids = [e['event_id'] for e in events_linked]
            events_response = supabase.table("events").select("event_date").in_("id", event_ids).order("event_date", desc=True).limit(1).execute()
            
            if events_response.data:
                friend['last_event_date'] = events_response.data[0]['event_date']
            else:
                friend['last_event_date'] = None
        else:
            friend['last_event_date'] = None
            
    return friends