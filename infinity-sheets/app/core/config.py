import os
from typing import List

from pydantic import BaseModel, validator

class Settings(BaseModel):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/infinity")
    
    # Authentication settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    API_KEY_PREFIX: str = os.getenv("API_KEY_PREFIX", "inf_")
    API_KEY_HEADER: str = os.getenv("API_KEY_HEADER", "X-API-Key")
    
    # OpenAI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # API settings
    API_V1_STR: str = "/api"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        case_sensitive = True

settings = Settings() 