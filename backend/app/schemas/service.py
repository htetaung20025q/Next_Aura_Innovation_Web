"""Pydantic schemas for Service."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    number: Optional[str] = None
    description: str
    full_description: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    order: int = 0
    active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    number: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    features: Optional[List[str]] = None
    order: Optional[int] = None
    active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
