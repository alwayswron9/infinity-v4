from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import uuid

class DataRecordBase(BaseModel):
    """Base schema for data records"""
    pass

class DataRecordCreate(BaseModel):
    """Schema for creating a data record"""
    
    # Dynamic fields will be validated against the model definition
    __root__: Dict[str, Any]

class DataRecordUpdate(BaseModel):
    """Schema for updating a data record"""
    
    # Dynamic fields will be validated against the model definition
    __root__: Dict[str, Any]

class DataRecord(BaseModel):
    """Schema for a data record with metadata"""
    
    id: uuid.UUID = Field(alias="_id")
    created_at: datetime = Field(alias="_created_at")
    updated_at: datetime = Field(alias="_updated_at")
    
    # Dynamic data fields
    __root__: Dict[str, Any]
    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class ListRecordsQuery(BaseModel):
    """Query parameters for listing records"""
    
    filter: Optional[Dict[str, Any]] = Field(default_factory=dict)
    page: int = 1
    limit: int = 10

class SearchQuery(BaseModel):
    """Query parameters for searching records"""
    
    query: str
    filter: Optional[Dict[str, Any]] = Field(default_factory=dict)
    limit: int = 10
    min_similarity: float = 0.7

class SearchResult(BaseModel):
    """Search result with similarity score"""
    
    record: DataRecord
    similarity: float
