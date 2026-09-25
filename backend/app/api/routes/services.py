"""Public Service routes."""

from typing import List
from fastapi import APIRouter, HTTPException, status
from app.api.dependencies import SessionDep
from app.repositories.service_repo import ServiceRepository
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=List[ServiceResponse])
def get_services(db: SessionDep):
    """Retrieve all active studio capabilities/services."""
    repo = ServiceRepository(db)
    return repo.get_active()


@router.get("/{slug}", response_model=ServiceResponse)
def get_service_by_slug(slug: str, db: SessionDep):
    """Retrieve a service by slug."""
    repo = ServiceRepository(db)
    service = repo.get_by_slug(slug)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service with slug '{slug}' not found",
        )
    return service
