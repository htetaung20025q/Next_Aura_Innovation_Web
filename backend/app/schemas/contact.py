"""Pydantic schemas for ContactSubmission."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactSubmissionCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=255)
    service_interest: Optional[str] = Field(None, max_length=255)
    budget: Optional[str] = Field(None, max_length=100)
    message: str = Field(..., min_length=10)


class ContactSubmissionUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|in_review|responded|archived)$")


class ContactSubmissionResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str] = None
    service_interest: Optional[str] = None
    budget: Optional[str] = None
    message: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
