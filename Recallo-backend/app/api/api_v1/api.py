from fastapi import APIRouter
from app.api.api_v1.endpoints import example
from app.api.api_v1.endpoints import users
from app.api.api_v1.endpoints import friends
from app.api.api_v1.endpoints import events
from app.api.api_v1.endpoints import relations
from app.api.api_v1.endpoints import content
from app.api.api_v1.endpoints import process_audio
from app.api.api_v1.endpoints import quiz


api_router = APIRouter()
api_router.include_router(example.router, prefix="/example", tags=["example"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(friends.router, prefix="/friends", tags=["friends"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(relations.router, prefix="/relations", tags=["relations"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(process_audio.router, prefix="/process_audio", tags=["process_audio"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
