from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Recallo Backend"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    SUPABASE_URL: str
    SUPABASE_KEY: str

    model_config = {"case_sensitive": True}

settings = Settings()
