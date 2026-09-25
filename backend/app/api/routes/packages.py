"""Public Package routes."""

from typing import List
from fastapi import APIRouter, HTTPException, status
from app.api.dependencies import SessionDep
from app.repositories.package_repo import PackageRepository
from app.schemas.package import PackageResponse

router = APIRouter(prefix="/packages", tags=["Packages"])


@router.get("", response_model=List[PackageResponse])
def get_packages(db: SessionDep):
    """Retrieve all active investment packages."""
    repo = PackageRepository(db)
    return repo.get_active()


@router.get("/{slug}", response_model=PackageResponse)
def get_package_by_slug(slug: str, db: SessionDep):
    """Retrieve package detail by slug."""
    repo = PackageRepository(db)
    pkg = repo.get_by_slug(slug)
    if not pkg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Package with slug '{slug}' not found",
        )
    return pkg
