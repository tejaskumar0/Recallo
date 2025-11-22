from fastapi import APIRouter
from app.api.api_v1.endpoints import example, users, friends, events, relations, content

api_router = APIRouter()
api_router.include_router(example.router, prefix="/example", tags=["example"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(friends.router, prefix="/friends", tags=["friends"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(relations.router, prefix="/relations", tags=["relations"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
