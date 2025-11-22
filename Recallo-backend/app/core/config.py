from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Recallo Backend"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    SUPABASE_URL: str = Field(validation_alias=AliasChoices("SUPABASE_URL", "REACT_APP_SUPABASE_URL"))
    SUPABASE_KEY: str = Field(validation_alias=AliasChoices("SUPABASE_KEY", "REACT_APP_SUPABASE_ANON_KEY"))

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
