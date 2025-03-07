import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError, ValidationError, AuthorizationError
from app.db.models import ModelDefinition
from app.schemas.model import ModelDefinitionCreate, ModelDefinitionUpdate

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self, db: AsyncSession):
        """Initialize the model service with database session"""
        self.db = db
    
    async def create_model(self, model_data: ModelDefinitionCreate, owner_id: uuid.UUID):
        """Create a new model definition"""
        # Validate model data
        self._validate_model(model_data)
        
        # Create model definition
        model = ModelDefinition(
            owner_id=owner_id,
            name=model_data.name,
            description=model_data.description,
            fields=model_data.fields,
            relationships=model_data.relationships,
            indexes=model_data.indexes,
            embedding=model_data.embedding,
            status="active",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        try:
            # Add to database
            self.db.add(model)
            await self.db.flush()
            await self.db.refresh(model)
            
            logger.info(f"Created model definition: {model.id}")
            return model
        except Exception as e:
            logger.error(f"Error creating model: {str(e)}")
            raise ValidationError(f"Failed to create model: {str(e)}")
    
    async def get_model(self, model_id: uuid.UUID):
        """Get a model definition by ID"""
        query = select(ModelDefinition).where(ModelDefinition.id == model_id)
        result = await self.db.execute(query)
        model = result.scalars().first()
        
        if not model:
            logger.warning(f"Model not found: {model_id}")
            raise NotFoundError(f"Model with ID {model_id} not found")
            
        return model
    
    async def list_models(self, owner_id: uuid.UUID):
        """List all model definitions for an owner"""
        query = select(ModelDefinition).where(
            ModelDefinition.owner_id == owner_id,
            ModelDefinition.status == "active"
        )
        result = await self.db.execute(query)
        models = result.scalars().all()
        
        return models
    
    async def update_model(self, model_id: uuid.UUID, model_data: ModelDefinitionUpdate, owner_id: uuid.UUID):
        """Update a model definition"""
        # Get existing model
        model = await self.get_model(model_id)
        
        # Check ownership
        if model.owner_id != owner_id:
            logger.warning(f"Unauthorized model update attempt: {model_id} by {owner_id}")
            raise AuthorizationError("You don't have permission to update this model")
        
        # Prepare update data
        update_data = {}
        if model_data.name is not None:
            update_data["name"] = model_data.name
        if model_data.description is not None:
            update_data["description"] = model_data.description
        if model_data.fields is not None:
            update_data["fields"] = model_data.fields
        if model_data.relationships is not None:
            update_data["relationships"] = model_data.relationships
        if model_data.indexes is not None:
            update_data["indexes"] = model_data.indexes
        if model_data.embedding is not None:
            update_data["embedding"] = model_data.embedding
            
        update_data["updated_at"] = datetime.utcnow()
        
        # Validate updated model
        if "fields" in update_data:
            self._validate_model_fields(update_data["fields"])
        
        try:
            # Update model
            query = update(ModelDefinition).where(
                ModelDefinition.id == model_id
            ).values(**update_data)
            
            await self.db.execute(query)
            
            # Get updated model
            updated_model = await self.get_model(model_id)
            logger.info(f"Updated model definition: {model_id}")
            return updated_model
        except Exception as e:
            logger.error(f"Error updating model: {str(e)}")
            raise ValidationError(f"Failed to update model: {str(e)}")
    
    async def delete_model(self, model_id: uuid.UUID, owner_id: uuid.UUID):
        """Delete a model definition"""
        # Get existing model
        model = await self.get_model(model_id)
        
        # Check ownership
        if model.owner_id != owner_id:
            logger.warning(f"Unauthorized model deletion attempt: {model_id} by {owner_id}")
            raise AuthorizationError("You don't have permission to delete this model")
        
        try:
            # Delete model
            query = delete(ModelDefinition).where(ModelDefinition.id == model_id)
            await self.db.execute(query)
            
            logger.info(f"Deleted model definition: {model_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting model: {str(e)}")
            raise ValidationError(f"Failed to delete model: {str(e)}")
    
    def _validate_model(self, model_data: ModelDefinitionCreate):
        """Validate model definition data"""
        # Check that model has at least one field
        if not model_data.fields or len(model_data.fields) == 0:
            raise ValidationError("Model must have at least one field")
            
        # Validate field definitions
        self._validate_model_fields(model_data.fields)
    
    def _validate_model_fields(self, fields: Dict[str, Any]):
        """Validate field definitions"""
        valid_field_types = ["string", "number", "boolean", "date", "vector"]
        
        for field_name, field_def in fields.items():
            # Check field name
            if not field_name or not isinstance(field_name, str):
                raise ValidationError(f"Invalid field name: {field_name}")
                
            # Check field type
            if "type" not in field_def:
                raise ValidationError(f"Field {field_name} is missing type")
                
            field_type = field_def.get("type")
            if field_type not in valid_field_types:
                raise ValidationError(f"Invalid field type for {field_name}: {field_type}")
                
            # Additional validation based on field type
            if field_type == "vector" and "dimensions" in field_def:
                dimensions = field_def.get("dimensions")
                if not isinstance(dimensions, int) or dimensions <= 0:
                    raise ValidationError(f"Invalid dimensions for vector field {field_name}: {dimensions}")
                    
            # Check for reserved field names
            reserved_prefixes = ["_", "$"]
            if any(field_name.startswith(prefix) for prefix in reserved_prefixes):
                raise ValidationError(f"Field name cannot start with reserved prefixes: {field_name}")
                
        return True
