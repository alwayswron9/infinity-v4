import os
from pydantic import BaseModel

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/infinity")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    API_KEY_PREFIX: str = os.getenv("API_KEY_PREFIX", "inf_")
    API_KEY_HEADER: str = os.getenv("API_KEY_HEADER", "X-API-Key")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # API settings
    API_V1_STR: str = "/api"
    
    class Config:
        case_sensitive = True

settings = Settings()
