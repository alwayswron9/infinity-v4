import jwt
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

from fastapi import Depends, Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthenticationError, AuthorizationError
from app.db.session import get_db

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Validate JWT token and return user information
    """
    try:
        payload = jwt.decode(
            credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid authentication credentials")
        
        # In a real application, you would verify the user exists in the database
        # For compatibility with the Node.js implementation, return the user ID as a string
        return {"id": user_id, "email": payload.get("email")}
    except jwt.PyJWTError:
        raise AuthenticationError("Invalid authentication credentials")

async def get_api_key_user(request: Request, db: AsyncSession = Depends(get_db)) -> Optional[Dict]:
    """
    Validate API key and return user information
    """
    api_key = request.headers.get(settings.API_KEY_HEADER)
    
    if not api_key:
        return None
        
    if not api_key.startswith(settings.API_KEY_PREFIX):
        return None
    
    try:
        # In a real application, you would look up the API key in the database
        # and return the associated user
        # For now, we'll just extract a user ID from the key for demonstration
        
        # Format: inf_USER_ID_RANDOM_STRING
        parts = api_key.split("_")
        if len(parts) < 3:
            return None
            
        user_id = parts[1]
        
        # Validate UUID format
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return None
            
        # In a real application, you would verify the user exists in the database
        # For compatibility with the Node.js implementation, return the user ID as a string
        return {"id": str(user_uuid), "api_key": api_key}
    except Exception:
        return None

async def get_authenticated_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Get authenticated user from either JWT token or API key
    """
    # Try JWT authentication first
    try:
        credentials = await security(request)
        return await get_current_user(credentials, db)
    except HTTPException:
        # If JWT auth fails, try API key
        user = await get_api_key_user(request, db)
        if user:
            return user
        
        # If both fail, raise authentication error
        raise AuthenticationError("Authentication required")

def create_access_token(user_id: uuid.UUID, email: str, expires_delta: timedelta = timedelta(days=1)) -> str:
    """
    Create a JWT access token
    """
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")
