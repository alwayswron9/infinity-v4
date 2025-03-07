from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from app.db.session import get_db
from app.schemas.data import DataRecord, DataRecordCreate, DataRecordUpdate, SearchQuery
from app.services.data_service import DataService
from app.core.auth import get_authenticated_user
from app.core.errors import NotFoundError, ValidationError, AuthorizationError
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/{model_id}", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_record(
    model_id: uuid.UUID,
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Create a new data record or bulk create records"""
    
    data_service = DataService(db)
    
    try:
        # Check if this is a bulk operation (array of objects)
        if isinstance(data, list):
            if len(data) == 0:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"success": False, "error": "Empty array provided. At least one record is required."}
                )
            
            # Process each record in the array
            results = []
            errors = []
            
            for i, item in enumerate(data):
                try:
                    # Validate fields structure for each item
                    if not isinstance(item, dict):
                        raise ValidationError("Each item must be a valid object")
                    
                    record = await data_service.create_record(model_id, item, uuid.UUID(current_user["id"]))
                    results.append(record)
                except Exception as e:
                    errors.append({
                        "index": i,
                        "error": str(e),
                        "data": item
                    })
            
            # Return appropriate response based on results
            return JSONResponse(
                status_code=status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED,
                content={
                    "success": errors == [],
                    "data": results,
                    "errors": errors if errors else None,
                    "meta": {
                        "total": len(data),
                        "succeeded": len(results),
                        "failed": len(errors)
                    }
                }
            )
        else:
            # Single record creation
            record = await data_service.create_record(model_id, data, uuid.UUID(current_user["id"]))
            return {"success": True, "data": record}
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

@router.get("/{model_id}", response_model=Dict[str, Any])
async def list_records(
    model_id: uuid.UUID,
    filter: Dict[str, Any] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """List data records with pagination and filtering"""
    
    data_service = DataService(db)
    
    try:
        result = await data_service.list_records(model_id, filter, page, limit)
        return {"success": True, "data": result["records"], "meta": result["pagination"]}
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

@router.get("/{model_id}/{record_id}", response_model=Dict[str, Any])
async def get_record(
    model_id: uuid.UUID,
    record_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Get a data record by ID"""
    
    data_service = DataService(db)
    
    try:
        record = await data_service.get_record(model_id, record_id)
        return {"success": True, "data": record}
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

@router.put("/{model_id}/{record_id}", response_model=Dict[str, Any])
async def update_record(
    model_id: uuid.UUID,
    record_id: uuid.UUID,
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Update a data record"""
    
    data_service = DataService(db)
    
    try:
        updated_record = await data_service.update_record(model_id, record_id, data, uuid.UUID(current_user["id"]))
        return {"success": True, "data": updated_record}
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
    except AuthorizationError as e:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.put("/{model_id}", response_model=Dict[str, Any])
async def bulk_update_records(
    model_id: uuid.UUID,
    data: List[Dict[str, Any]],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Bulk update data records"""
    
    data_service = DataService(db)
    
    try:
        if not isinstance(data, list) or len(data) == 0:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "error": "Expected a non-empty array of records"}
            )
        
        # Process each record in the array
        results = []
        errors = []
        
        for i, item in enumerate(data):
            try:
                # Validate record structure
                if not isinstance(item, dict) or "_id" not in item:
                    raise ValidationError("Each item must be a valid object with an _id field")
                
                record_id = item.pop("_id")
                updated_record = await data_service.update_record(
                    model_id, 
                    uuid.UUID(record_id), 
                    item, 
                    uuid.UUID(current_user["id"])
                )
                results.append(updated_record)
            except Exception as e:
                errors.append({
                    "index": i,
                    "error": str(e),
                    "data": item
                })
        
        # Return appropriate response based on results
        return JSONResponse(
            status_code=status.HTTP_207_MULTI_STATUS if errors else status.HTTP_200_OK,
            content={
                "success": errors == [],
                "data": results,
                "errors": errors if errors else None,
                "meta": {
                    "total": len(data),
                    "succeeded": len(results),
                    "failed": len(errors)
                }
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.delete("/{model_id}/{record_id}", response_model=Dict[str, Any])
async def delete_record(
    model_id: uuid.UUID,
    record_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Delete a data record"""
    
    data_service = DataService(db)
    
    try:
        await data_service.delete_record(model_id, record_id, uuid.UUID(current_user["id"]))
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content={"success": True, "data": None}
        )
    except NotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"success": False, "error": str(e)}
        )
    except AuthorizationError as e:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"success": False, "error": str(e)}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": str(e)}
        )

@router.post("/{model_id}/search", response_model=Dict[str, Any])
async def search_records(
    model_id: uuid.UUID,
    search_query: SearchQuery,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_authenticated_user)
):
    """Search for records using vector similarity"""
    
    data_service = DataService(db)
    
    try:
        results = await data_service.search_records(
            model_id, 
            search_query.query, 
            search_query.filter, 
            search_query.limit, 
            search_query.min_similarity
        )
        return {"success": True, "data": results}
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
