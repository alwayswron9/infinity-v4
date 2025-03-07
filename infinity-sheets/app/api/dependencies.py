from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.model_service import ModelService
from app.services.data_service import DataService

def get_model_service(db: AsyncSession = Depends(get_db)) -> ModelService:
    """Dependency for getting the model service"""
    return ModelService(db)

def get_data_service(db: AsyncSession = Depends(get_db)) -> DataService:
    """Dependency for getting the data service"""
    return DataService(db)
