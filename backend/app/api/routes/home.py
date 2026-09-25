"""Public Home content routes."""

from typing import Any, Dict, List
from fastapi import APIRouter
from pydantic import BaseModel
from app.api.dependencies import SessionDep
from app.repositories.content_repo import ContentRepository
from app.repositories.project_repo import ProjectRepository
from app.repositories.service_repo import ServiceRepository
from app.schemas.content import HomeContentSchema, SiteSettingsSchema
from app.schemas.project import ProjectResponse
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/home", tags=["Home"])


class HomeAggregateResponse(BaseModel):
    content: HomeContentSchema
    settings: SiteSettingsSchema
    projects: List[ProjectResponse]
    services: List[ServiceResponse]


@router.get("", response_model=HomeAggregateResponse)
def get_home_data(db: SessionDep):
    """Retrieve all data required for the homepage in a single unified payload."""
    content_repo = ContentRepository(db)
    project_repo = ProjectRepository(db)
    service_repo = ServiceRepository(db)

    return {
        "content": content_repo.get_home_content(),
        "settings": content_repo.get_settings(),
        "projects": project_repo.get_published(),
        "services": service_repo.get_active(),
    }
