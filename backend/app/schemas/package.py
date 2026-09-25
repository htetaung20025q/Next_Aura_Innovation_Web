"""Pydantic schemas for Package."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PackageBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    price: float
    formatted_price: str = Field(..., max_length=50)
    currency: str = Field(default="MMK", max_length=10)
    short_description: str = Field(..., max_length=255)
    description: str
    features: List[str] = Field(default_factory=list)
    suitable_for: Optional[str] = None
    is_popular: bool = False
    is_active: bool = True
    sort_order: int = 0


class PackageCreate(PackageBase):
    pass


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    price: Optional[float] = None
    formatted_price: Optional[str] = None
    currency: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    suitable_for: Optional[str] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class PackageResponse(PackageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
