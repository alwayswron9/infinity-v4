from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, text
from sqlalchemy.sql import func
import uuid
from datetime import datetime
import logging
import json

from app.db.models import ModelData
from app.services.model_service import ModelService
from app.services.embedding_service import EmbeddingService
from app.core.errors import NotFoundError, ValidationError, AuthorizationError

logger = logging.getLogger(__name__)

class DataService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.model_service = ModelService(db)
        self.embedding_service = EmbeddingService()
    
    async def create_record(self, model_id: uuid.UUID, data: dict, owner_id: uuid.UUID):
        """Create a new data record"""
        
        # Get model definition
        model = await self.model_service.get_model(model_id)
        
        # Validate data against model definition
        await self._validate_data(data, model.fields)
        
        # Generate embedding if enabled
        embedding = None
        if model.embedding and model.embedding.get("enabled", False):
            source_fields = model.embedding.get("source_fields", [])
            if source_fields:
                text_for_embedding = self._get_text_for_embedding(data, source_fields)
                if text_for_embedding:
                    embedding = await self.embedding_service.generate_embedding(text_for_embedding)
        
        # Create record
        record = ModelData(
            model_id=model_id,
            owner_id=owner_id,
            data=data,
            embedding=embedding,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        try:
            # Add to database
            self.db.add(record)
            await self.db.flush()
            await self.db.refresh(record)
            
            logger.info(f"Created data record: {record.id} for model: {model_id}")
            return self._to_client_record(record)
        except Exception as e:
            logger.error(f"Error creating data record: {str(e)}")
            raise ValidationError(f"Failed to create data record: {str(e)}")
    
    async def get_record(self, model_id: uuid.UUID, record_id: uuid.UUID):
        """Get a data record by ID"""
        
        query = select(ModelData).where(
            ModelData.model_id == model_id,
            ModelData.id == record_id
        )
        result = await self.db.execute(query)
        record = result.scalars().first()
        
        if not record:
            logger.warning(f"Record not found: {record_id} for model: {model_id}")
            raise NotFoundError(f"Record with ID {record_id} not found")
        
        return self._to_client_record(record)
    
    async def list_records(self, model_id: uuid.UUID, filter_data: dict = None, page: int = 1, limit: int = 10):
        """List data records with pagination and filtering"""
        # Validate model exists
        await self.model_service.get_model(model_id)
        
        # Build query
        query = select(ModelData).where(ModelData.model_id == model_id)
        
        # Apply filters if provided
        if filter_data:
            for field, value in filter_data.items():
                # For JSON fields, we need to use the -> operator
                if isinstance(value, dict):
                    # Complex filter with operators
                    operator = value.get("operator", "eq")
                    filter_value = value.get("value")
                    
                    if operator == "eq":
                        query = query.where(text(f"data->'{field}' = '{filter_value}'"))
                    elif operator == "neq":
                        query = query.where(text(f"data->'{field}' != '{filter_value}'"))
                    elif operator == "gt":
                        query = query.where(text(f"data->'{field}' > '{filter_value}'"))
                    elif operator == "gte":
                        query = query.where(text(f"data->'{field}' >= '{filter_value}'"))
                    elif operator == "lt":
                        query = query.where(text(f"data->'{field}' < '{filter_value}'"))
                    elif operator == "lte":
                        query = query.where(text(f"data->'{field}' <= '{filter_value}'"))
                    elif operator == "contains":
                        query = query.where(text(f"data->'{field}' LIKE '%{filter_value}%'"))
                else:
                    # Simple equality filter
                    query = query.where(text(f"data->'{field}' = '{value}'"))
        
        # Add pagination
        total_query = select(func.count()).select_from(ModelData).where(ModelData.model_id == model_id)
        total_result = await self.db.execute(total_query)
        total = total_result.scalar()
        
        query = query.order_by(ModelData.created_at.desc())
        query = query.offset((page - 1) * limit).limit(limit)
        
        # Execute query
        result = await self.db.execute(query)
        records = result.scalars().all()
        
        # Convert to client records
        client_records = [self._to_client_record(record) for record in records]
        
        # Calculate pagination metadata
        total_pages = (total + limit - 1) // limit if total > 0 else 1
        
        return {
            "records": client_records,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": total_pages,
                "hasNextPage": page < total_pages,
                "hasPreviousPage": page > 1
            }
        }
    
    async def update_record(self, model_id: uuid.UUID, record_id: uuid.UUID, data: dict, owner_id: uuid.UUID):
        """Update a data record"""
        
        # Get model definition
        model = await self.model_service.get_model(model_id)
        
        # Get existing record
        query = select(ModelData).where(
            ModelData.model_id == model_id,
            ModelData.id == record_id
        )
        result = await self.db.execute(query)
        record = result.scalars().first()
        
        if not record:
            logger.warning(f"Record not found: {record_id} for model: {model_id}")
            raise NotFoundError(f"Record with ID {record_id} not found")
        
        # Check ownership
        if record.owner_id != owner_id:
            logger.warning(f"Unauthorized record update attempt: {record_id} by {owner_id}")
            raise AuthorizationError("You don't have permission to update this record")
        
        # Validate data against model definition
        await self._validate_data(data, model.fields)
        
        # Generate embedding if enabled
        embedding = record.embedding
        if model.embedding and model.embedding.get("enabled", False):
            source_fields = model.embedding.get("source_fields", [])
            if source_fields:
                text_for_embedding = self._get_text_for_embedding(data, source_fields)
                if text_for_embedding:
                    embedding = await self.embedding_service.generate_embedding(text_for_embedding)
        
        try:
            # Update record
            query = update(ModelData).where(
                ModelData.id == record_id
            ).values(
                data=data,
                embedding=embedding,
                updated_at=datetime.utcnow()
            )
            
            await self.db.execute(query)
            
            # Get updated record
            updated_record = await self.get_record(model_id, record_id)
            logger.info(f"Updated data record: {record_id}")
            return updated_record
        except Exception as e:
            logger.error(f"Error updating data record: {str(e)}")
            raise ValidationError(f"Failed to update data record: {str(e)}")
    
    async def delete_record(self, model_id: uuid.UUID, record_id: uuid.UUID, owner_id: uuid.UUID):
        """Delete a data record"""
        
        # Get existing record
        query = select(ModelData).where(
            ModelData.model_id == model_id,
            ModelData.id == record_id
        )
        result = await self.db.execute(query)
        record = result.scalars().first()
        
        if not record:
            logger.warning(f"Record not found: {record_id} for model: {model_id}")
            raise NotFoundError(f"Record with ID {record_id} not found")
        
        # Check ownership
        if record.owner_id != owner_id:
            logger.warning(f"Unauthorized record deletion attempt: {record_id} by {owner_id}")
            raise AuthorizationError("You don't have permission to delete this record")
        
        try:
            # Delete record
            query = delete(ModelData).where(ModelData.id == record_id)
            await self.db.execute(query)
            
            logger.info(f"Deleted data record: {record_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting data record: {str(e)}")
            raise ValidationError(f"Failed to delete data record: {str(e)}")
    
    async def search_records(self, model_id: uuid.UUID, query_text: str, filter_data: dict = None, limit: int = 10, min_similarity: float = 0.7):
        """Search for records using vector similarity"""
        # Get model definition
        model = await self.model_service.get_model(model_id)
        
        # Check if embedding is enabled for this model
        if not model.embedding or not model.embedding.get("enabled", False):
            logger.warning(f"Vector search attempted on model without embeddings: {model_id}")
            raise ValidationError("Vector search is not enabled for this model")
        
        # Generate embedding for query text
        query_embedding = await self.embedding_service.generate_embedding(query_text)
        if not query_embedding:
            raise ValidationError("Failed to generate embedding for search query")
        
        # Build query
        # This is a simplified approach - in a production environment, you would use
        # pgvector's vector similarity functions for better performance
        query = select(ModelData).where(ModelData.model_id == model_id)
        
        # Apply filters if provided
        if filter_data:
            for field, value in filter_data.items():
                if isinstance(value, dict):
                    # Complex filter with operators
                    operator = value.get("operator", "eq")
                    filter_value = value.get("value")
                    
                    if operator == "eq":
                        query = query.where(text(f"data->'{field}' = '{filter_value}'"))
                    elif operator == "neq":
                        query = query.where(text(f"data->'{field}' != '{filter_value}'"))
                    elif operator == "gt":
                        query = query.where(text(f"data->'{field}' > '{filter_value}'"))
                    elif operator == "gte":
                        query = query.where(text(f"data->'{field}' >= '{filter_value}'"))
                    elif operator == "lt":
                        query = query.where(text(f"data->'{field}' < '{filter_value}'"))
                    elif operator == "lte":
                        query = query.where(text(f"data->'{field}' <= '{filter_value}'"))
                    elif operator == "contains":
                        query = query.where(text(f"data->'{field}' LIKE '%{filter_value}%'"))
                else:
                    # Simple equality filter
                    query = query.where(text(f"data->'{field}' = '{value}'"))
        
        # Execute query to get all records (with limit)
        # In a production environment, you would use a more efficient approach
        result = await self.db.execute(query.limit(100))  # Limit to avoid processing too many records
        records = result.scalars().all()
        
        # Calculate similarity scores
        search_results = []
        for record in records:
            if record.embedding:
                similarity = self.embedding_service.calculate_similarity(query_embedding, record.embedding)
                if similarity >= min_similarity:
                    search_results.append({
                        "record": self._to_client_record(record),
                        "similarity": similarity
                    })
        
        # Sort by similarity (descending) and apply limit
        search_results.sort(key=lambda x: x["similarity"], reverse=True)
        search_results = search_results[:limit]
        
        return search_results
    
    async def _validate_data(self, data: dict, field_definitions: dict):
        """Validate data against field definitions"""
        if not isinstance(data, dict):
            raise ValidationError("Data must be a dictionary")
        
        # Check required fields
        for field_name, field_def in field_definitions.items():
            if field_def.get("required", False) and field_name not in data:
                raise ValidationError(f"Required field missing: {field_name}")
        
        # Validate field types and constraints
        for field_name, field_value in data.items():
            # Skip if field is not in model definition (could be extra data)
            if field_name not in field_definitions:
                continue
                
            field_def = field_definitions[field_name]
            field_type = field_def.get("type")
            
            # Type validation
            if field_value is not None:
                if field_type == "string" and not isinstance(field_value, str):
                    raise ValidationError(f"Field {field_name} must be a string")
                elif field_type == "number" and not isinstance(field_value, (int, float)):
                    raise ValidationError(f"Field {field_name} must be a number")
                elif field_type == "boolean" and not isinstance(field_value, bool):
                    raise ValidationError(f"Field {field_name} must be a boolean")
                elif field_type == "date":
                    # Date validation is more complex - could be a string in ISO format
                    if not isinstance(field_value, (str, datetime)):
                        raise ValidationError(f"Field {field_name} must be a date string or datetime object")
            
            # Enum validation for string fields
            if field_type == "string" and "enum" in field_def and field_def["enum"]:
                if field_value not in field_def["enum"]:
                    raise ValidationError(f"Field {field_name} must be one of: {', '.join(field_def['enum'])}")
            
            # Range validation for number fields
            if field_type == "number":
                if "min" in field_def and field_value < field_def["min"]:
                    raise ValidationError(f"Field {field_name} must be at least {field_def['min']}")
                if "max" in field_def and field_value > field_def["max"]:
                    raise ValidationError(f"Field {field_name} must be at most {field_def['max']}")
    
    def _get_text_for_embedding(self, data: dict, source_fields: list) -> str:
        """Extract text from specified fields for embedding generation"""
        if not source_fields:
            return ""
            
        text_parts = []
        for field in source_fields:
            if field in data and isinstance(data[field], str):
                text_parts.append(data[field])
        
        return " ".join(text_parts)
    
    def _to_client_record(self, db_record) -> dict:
        """Convert database record to client-friendly format"""
        # Combine metadata and data
        record_data = db_record.data.copy() if db_record.data else {}
        
        # Add metadata with underscore prefix
        record_data["_id"] = str(db_record.id)
        record_data["_created_at"] = db_record.created_at.isoformat() if db_record.created_at else None
        record_data["_updated_at"] = db_record.updated_at.isoformat() if db_record.updated_at else None
        
        # Don't include the embedding vector in the response
        
        return record_data
