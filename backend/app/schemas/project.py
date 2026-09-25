"""Pydantic schemas for Project."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class TechnologySchema(BaseModel):
    name: str
    slug: str

    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    category: str = Field(..., max_length=255)
    description: str
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    featured: bool = True
    published: bool = True
    order: int = 0
    technologies: List[TechnologySchema] = Field(default_factory=list)

    @model_validator(mode="after")
    def sync_images(self):
        if self.thumbnail_url and not self.image_url:
            self.image_url = self.thumbnail_url
        elif self.image_url and not self.thumbnail_url:
            self.thumbnail_url = self.image_url
        return self


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None
    order: Optional[int] = None
    technologies: Optional[List[TechnologySchema]] = None

    @model_validator(mode="after")
    def sync_images(self):
        if self.thumbnail_url and not self.image_url:
            self.image_url = self.thumbnail_url
        elif self.image_url and not self.thumbnail_url:
            self.thumbnail_url = self.image_url
        return self


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedProjectResponse(BaseModel):
    items: List[ProjectResponse]
    pagination: PaginationMeta

