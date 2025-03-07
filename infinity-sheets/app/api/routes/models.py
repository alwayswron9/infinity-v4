from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from app.db.session import get_db
from app.schemas.model import ModelDefinition, ModelDefinitionCreate, ModelDefinitionUpdate
from app.services.model_service import ModelService
from app.core.auth import get_authenticated_user
from app.core.errors import NotFoundError, ValidationError
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_model(
    model_data: ModelDefinitionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Create a new model definition"""
    
    model_service = ModelService(db)
    
    try:
        model = await model_service.create_model(model_data, uuid.UUID(current_user["id"]))
        return {"success": True, "data": model}
    except ValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.get("/", response_model=Dict[str, Any])
async def list_models(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """List all model definitions for the current user"""
    
    model_service = ModelService(db)
    
    try:
        models = await model_service.list_models(uuid.UUID(current_user["id"]))
        return {"success": True, "data": models}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.get("/{model_id}", response_model=Dict[str, Any])
async def get_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Get a model definition by ID"""
    
    model_service = ModelService(db)
    
    try:
        model = await model_service.get_model(model_id)
        
        # Check ownership
        if str(model.owner_id) != str(current_user["id"]):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"success": False, "error": "Not authorized to access this model"}
            )
        
        return {"success": True, "data": model}
    except NotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.put("/{model_id}", response_model=Dict[str, Any])
async def update_model(
    model_id: uuid.UUID,
    model_data: ModelDefinitionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Update a model definition"""
    
    model_service = ModelService(db)
    
    try:
        updated_model = await model_service.update_model(model_id, model_data, uuid.UUID(current_user["id"]))
        return {"success": True, "data": updated_model}
    except NotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"success": False, "error": str(e)}
        )
    except ValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.delete("/{model_id}", response_model=Dict[str, Any])
async def delete_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Delete a model definition"""
    
    model_service = ModelService(db)
    
    try:
        await model_service.delete_model(model_id, uuid.UUID(current_user["id"]))
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content={"success": True, "data": None}
        )
    except NotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"success": False, "error": str(e)}
        )
    except ValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )
