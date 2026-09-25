"""Public Settings routes."""

from fastapi import APIRouter
from app.api.dependencies import SessionDep
from app.repositories.content_repo import ContentRepository
from app.schemas.content import SiteSettingsSchema

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SiteSettingsSchema)
def get_site_settings(db: SessionDep):
    """Retrieve public studio site settings."""
    repo = ContentRepository(db)
    return repo.get_settings()
