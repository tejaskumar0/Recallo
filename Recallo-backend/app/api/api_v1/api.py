from fastapi import APIRouter
from app.api.api_v1.endpoints import example, users

api_router = APIRouter()
api_router.include_router(example.router, prefix="/example", tags=["example"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
