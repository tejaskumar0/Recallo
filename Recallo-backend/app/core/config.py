from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Recallo Backend"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DEEPGRAM_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    model_config = {"case_sensitive": True, "env_file": ".env"}

settings = Settings()
