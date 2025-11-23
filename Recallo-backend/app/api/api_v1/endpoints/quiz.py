from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import anthropic
import json
import os
from pydantic import BaseModel

from app.core.supabase import supabase

router = APIRouter()

# Initialize Anthropic client
client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

class QuizRequest(BaseModel):
    user_id: str
    friend_id: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    topic: str
    explanation: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    friend_name: str

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(quiz_request: QuizRequest):
    """
    Generate a quiz based on user-friend interactions
    """
    try:
        # Get friend name
        friend_response = supabase.table("friends").select("friend_name").eq("id", quiz_request.friend_id).single().execute()
        if not friend_response.data:
            raise HTTPException(status_code=404, detail="Friend not found")
        friend_name = friend_response.data["friend_name"]
        
        # Get all user-friend-event relationships
        relations_response = supabase.table("user_friends_events")\
            .select("id, event_id")\
            .eq("user_id", quiz_request.user_id)\
            .eq("friend_id", quiz_request.friend_id)\
            .execute()
        
        if not relations_response.data or len(relations_response.data) < 2:
            raise HTTPException(status_code=400, detail="Not enough interactions with this friend")
        
        # Get all content for these relationships
        relation_ids = [rel["id"] for rel in relations_response.data]
        content_response = supabase.table("event_person_topics_content")\
            .select("*")\
            .in_("user_friend_event_id", relation_ids)\
            .execute()
        
        if not content_response.data:
            raise HTTPException(status_code=404, detail="No content found for this friend")
        
        # Get event details for context
        event_ids = [rel["event_id"] for rel in relations_response.data]
        events_response = supabase.table("events")\
            .select("id, event_name, event_date")\
            .in_("id", event_ids)\
            .execute()
        
        events_dict = {event["id"]: event for event in events_response.data}
        
        # Prepare content for quiz generation
        content_by_event = {}
        for content in content_response.data:
            # Find the event for this content
            event_id = None
            for rel in relations_response.data:
                if rel["id"] == content["user_friend_event_id"]:
                    event_id = rel["event_id"]
                    break
            
            if event_id and event_id in events_dict:
                event_name = events_dict[event_id]["event_name"]
                if event_name not in content_by_event:
                    content_by_event[event_name] = []
                content_by_event[event_name].append({
                    "topic": content["topic"],
                    "content": content["content"]
                })
        
        # Format content for the prompt
        formatted_content = f"Friend: {friend_name}\n\n"
        for event_name, topics in content_by_event.items():
            formatted_content += f"Event: {event_name}\n"
            for topic in topics:
                formatted_content += f"  Topic: {topic['topic']}\n"
                formatted_content += f"  Content: {topic['content']}\n\n"
        
        # Generate quiz using Claude
        prompt = f"""Based on the following conversation records between a user and their friend {friend_name}, create a 10-question multiple choice quiz.

{formatted_content}

Create exactly 10 questions that test memory of qualitative details about conversations, events, and topics discussed. Focus on memorable details, personal information shared, opinions expressed, and specific topics discussed.

Each question should:
1. Be clear and specific
2. Have 4 answer options (A, B, C, D)
3. Have only one correct answer
4. Test meaningful information rather than trivial details
5. Include a mix of different topics and events

Return the quiz in this exact JSON format:
{{
  "questions": [
    {{
      "question": "What did {friend_name} mention about...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "topic": "The main topic this question relates to",
      "explanation": "Brief explanation of why this is the correct answer"
    }}
  ]
}}

The correct_answer should be the index (0-3) of the correct option.
Make the questions engaging and focused on interesting details from the conversations."""

        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4000,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # Parse the response
        response_text = message.content[0].text
        
        # Extract JSON from the response
        try:
            # Find the JSON content
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            quiz_data = json.loads(json_str)
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse quiz response: {str(e)}")
        
        # Convert to response model
        questions = []
        for q in quiz_data["questions"]:
            questions.append(QuizQuestion(
                question=q["question"],
                options=q["options"],
                correct_answer=q["correct_answer"],
                topic=q.get("topic", "General"),
                explanation=q.get("explanation", "")
            ))
        
        return QuizResponse(
            questions=questions,
            friend_name=friend_name
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content/{user_id}/{friend_id}")
async def get_friend_content(user_id: str, friend_id: str):
    """
    Get all content for a specific user-friend combination
    """
    try:
        # Get all user-friend-event relationships
        relations_response = supabase.table("user_friends_events")\
            .select("id, event_id")\
            .eq("user_id", user_id)\
            .eq("friend_id", friend_id)\
            .execute()
        
        if not relations_response.data:
            return {"events": [], "content": []}
        
        # Get all content for these relationships
        relation_ids = [rel["id"] for rel in relations_response.data]
        content_response = supabase.table("event_person_topics_content")\
            .select("*")\
            .in_("user_friend_event_id", relation_ids)\
            .execute()
        
        # Get event details
        event_ids = [rel["event_id"] for rel in relations_response.data]
        events_response = supabase.table("events")\
            .select("*")\
            .in_("id", event_ids)\
            .execute()
        
        return {
            "events": events_response.data,
            "content": content_response.data,
            "relations": relations_response.data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))