from fastapi import APIRouter, HTTPException
from typing import List

from app import schemas
from app.core.supabase import supabase

router = APIRouter()

@router.post("/", response_model=schemas.Content)
def create_content(content: schemas.ContentCreate):
    response = supabase.table("event_person_topics_content").insert(content.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Content could not be created")
    return response.data[0]

@router.get("/", response_model=List[schemas.Content])
def read_content(skip: int = 0, limit: int = 100):
    response = supabase.table("event_person_topics_content").select("*").range(skip, skip + limit - 1).execute()
    return response.data


@router.get("/content/{user_friend_event_id}", response_model=List[schemas.Content])
def read_content_by_user_friend_event(user_friend_event_id: int):
    response = supabase.table("event_person_topics_content").select("*").eq("user_friend_event_id", user_friend_event_id).execute()
    return response.data

@router.get("/{content_id}", response_model=schemas.Content)
def read_single_content(content_id: int):
    response = supabase.table("event_person_topics_content").select("*").eq("id", content_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Content not found")
    return response.data[0]

@router.put("/{content_id}", response_model=schemas.Content)
def update_content(content_id: int, content_in: schemas.ContentUpdate):
    update_data = content_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
    response = supabase.table("event_person_topics_content").update(update_data).eq("id", content_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Content not found")
    return response.data[0]

@router.delete("/{content_id}", response_model=schemas.Content)
def delete_content(content_id: int):
    response = supabase.table("event_person_topics_content").delete().eq("id", content_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Content not found")
    return response.data[0]

@router.post("/bulk", response_model=List[schemas.Content])
def create_bulk_content(bulk_data: schemas.content.BulkContentCreate):
    content_entries = []
    for topic_item in bulk_data.topics:
        content_entry = {
            "user_friend_event_id": bulk_data.user_friend_event_id,
            "topic": topic_item.topic,
            "content": topic_item.content
        }
        content_entries.append(content_entry)
    
    # Insert all entries at once
    response = supabase.table("event_person_topics_content").insert(content_entries).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Content could not be created")
    
    return response.data


