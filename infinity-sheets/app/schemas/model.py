from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import uuid

# Field definition schemas
class FieldDefinitionBase(BaseModel):
    type: str
    required: bool = False
    unique: bool = False
    description: Optional[str] = None

class StringFieldDefinition(FieldDefinitionBase):
    type: str = "string"
    default: Optional[str] = None
    enum: Optional[List[str]] = None

class NumberFieldDefinition(FieldDefinitionBase):
    type: str = "number"
    default: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None

class BooleanFieldDefinition(FieldDefinitionBase):
    type: str = "boolean"
    default: Optional[bool] = None

class DateFieldDefinition(FieldDefinitionBase):
    type: str = "date"
    default: Optional[datetime] = None

class VectorFieldDefinition(FieldDefinitionBase):
    type: str = "vector"
    dimensions: int = 1536  # Default for OpenAI embeddings

# Union type for all field definitions
FieldDefinition = Union[
    StringFieldDefinition, 
    NumberFieldDefinition,
    BooleanFieldDefinition,
    DateFieldDefinition,
    VectorFieldDefinition
]

# Relationship definition schema
class RelationshipDefinition(BaseModel):
    type: str  # one-to-one, one-to-many, many-to-many
    target_model: str
    foreign_key: Dict[str, str]
    cascade_delete: bool = False

# Index definition schema
class IndexDefinition(BaseModel):
    fields: List[str]
    unique: bool = False

# Embedding configuration schema
class EmbeddingConfig(BaseModel):
    enabled: bool = False
    source_fields: List[str] = []

# Model definition schemas
class ModelDefinitionBase(BaseModel):
    name: str
    description: Optional[str] = None
    fields: Dict[str, Any]  # Using Any instead of FieldDefinition for flexibility
    relationships: Optional[Dict[str, RelationshipDefinition]] = None
    indexes: Optional[Dict[str, IndexDefinition]] = None
    embedding: Optional[EmbeddingConfig] = None

class ModelDefinitionCreate(ModelDefinitionBase):
    pass

class ModelDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[Dict[str, Any]] = None
    relationships: Optional[Dict[str, RelationshipDefinition]] = None
    indexes: Optional[Dict[str, IndexDefinition]] = None
    embedding: Optional[EmbeddingConfig] = None

class ModelDefinition(ModelDefinitionBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
