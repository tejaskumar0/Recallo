from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import anthropic after loading env
import anthropic

from app.core.supabase import supabase

router = APIRouter()

# Initialize Anthropic client with explicit error handling
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    print("WARNING: ANTHROPIC_API_KEY not found in environment variables")
    raise ValueError("ANTHROPIC_API_KEY not configured")

try:
    client = anthropic.Anthropic(api_key=api_key)
    print("Anthropic client initialized successfully")
except Exception as e:
    print(f"Failed to initialize Anthropic client: {e}")
    raise

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
async def generate_quiz(request: QuizRequest):
    """
    Generate a quiz based on content between a user and friend using Anthropic Claude
    """
    try:
        # Fetch all content for user-friend pair
        response = supabase.table("user_friends_events").select(
            "id"
        ).eq("user_id", request.user_id).eq("friend_id", request.friend_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="No content found for this user-friend pair")
        
        user_friend_event_ids = [record['id'] for record in response.data]
        
        # Fetch all content for these IDs
        content_response = supabase.table("event_person_topics_content").select(
            "topic, content"
        ).in_("user_friend_event_id", user_friend_event_ids).execute()
        
        if not content_response.data or len(content_response.data) < 3:
            raise HTTPException(status_code=404, detail="Not enough memories found for this friend. Need at least 3 memories to generate a quiz.")
        
        # Get friend name
        friend_response = supabase.table("friends").select("friend_name").eq("id", request.friend_id).execute()
        friend_name = friend_response.data[0]['friend_name'] if friend_response.data else "Friend"
        
        # Prepare content for Claude
        memories = content_response.data
        # Ensure we have enough diverse content
        if len(memories) < 5:
            # Duplicate some memories to have enough variety for quiz generation
            memories = memories * 3
        memories_text = "\n".join([f"Topic: {m['topic']}\nContent: {m['content']}" for m in memories[:20]])  # Limit to 20 most recent
        
        # Generate quiz using Claude
        prompt = f"""You are a quiz generator. Based on these conversation memories between a user and {friend_name}, create exactly 10 multiple choice questions.

Memories:
{memories_text}

IMPORTANT: You must return ONLY a JSON array, no other text before or after.

Create diverse questions that test memory of conversations. Each question must have exactly 4 options with only 1 correct answer. Try to focus on more qualitative than very specific quantitative questions.

Return this exact JSON structure with 10 questions:
[
  {{
    "question": "string",
    "options": ["string1", "string2", "string3", "string4"],
    "correct_answer": 0,
    "topic": "string",
    "explanation": "string"
  }}
]

The correct_answer must be the index (0-3) of the correct option.
DO NOT include any text outside the JSON array. Start with [ and end with ]"""

        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=4000,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # Parse Claude's response
        response_text = message.content[0].text
        print(f"Claude response: {response_text[:500]}...")  # Debug logging
        
        # Extract JSON from response (Claude might add text before/after)
        import re
        
        # Try to find JSON array in the response
        json_match = re.search(r'\[[\s\S]*\]', response_text)
        
        if json_match:
            json_str = json_match.group()
            try:
                questions_data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Failed to parse extracted JSON: {e}")
                print(f"Extracted string: {json_str[:200]}...")
                # Try to clean up common issues
                json_str = json_str.replace('\n', ' ').replace('\\', '\\\\')
                questions_data = json.loads(json_str)
        else:
            print("No JSON array found in response")
            # Try parsing the whole response as a fallback
            try:
                questions_data = json.loads(response_text)
            except:
                # If all else fails, create a simple default question
                raise ValueError(f"Could not extract JSON from Claude response. Response starts with: {response_text[:200]}")
        
        # Validate and format questions
        formatted_questions = []
        for q in questions_data[:10]:  # Ensure max 10 questions
            formatted_questions.append(QuizQuestion(
                question=q['question'],
                options=q['options'][:4],  # Ensure exactly 4 options
                correct_answer=min(q['correct_answer'], 3),  # Ensure valid index
                topic=q.get('topic', 'General'),
                explanation=q.get('explanation', '')
            ))
        
        # If we have less than 10 questions, pad with some default ones
        while len(formatted_questions) < 10:
            formatted_questions.append(QuizQuestion(
                question=f"What topic did you discuss with {friend_name}?",
                options=[
                    memories[0]['topic'] if memories else "Topic 1",
                    "Different topic",
                    "Another topic", 
                    "Other topic"
                ],
                correct_answer=0,
                topic="General",
                explanation="This was one of the topics you discussed."
            ))
        
        return QuizResponse(
            questions=formatted_questions,
            friend_name=friend_name
        )
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response. The AI may not have returned valid JSON. Error: {str(e)}")
    except anthropic.APIError as e:
        print(f"Anthropic API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error. Please check your API key and try again. Error: {str(e)}")
    except ValueError as e:
        print(f"Value error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@router.get("/content/user/{user_id}/friend/{friend_id}")
async def get_user_friend_content(user_id: str, friend_id: str):
    """
    Get all content for a specific user-friend pair
    """
    try:
        # First get all user_friends_events IDs for this pair
        response = supabase.table("user_friends_events").select(
            "id"
        ).eq("user_id", user_id).eq("friend_id", friend_id).execute()
        
        if not response.data:
            return []
        
        user_friend_event_ids = [record['id'] for record in response.data]
        
        # Then get all content for these IDs
        content_response = supabase.table("event_person_topics_content").select(
            "*"
        ).in_("user_friend_event_id", user_friend_event_ids).execute()
        
        return content_response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))