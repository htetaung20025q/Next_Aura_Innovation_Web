"""Public Project routes."""

from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Query, status
from app.api.dependencies import SessionDep
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import PaginatedProjectResponse, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=Union[PaginatedProjectResponse, List[ProjectResponse]])
def get_projects(
    db: SessionDep,
    page: Optional[int] = Query(None, ge=1, description="Page number"),
    page_size: Optional[int] = Query(None, ge=1, le=20, description="Items per page (max 20)"),
):
    """Retrieve published projects with optional server-driven pagination."""
    repo = ProjectRepository(db)

    if page is not None or page_size is not None:
        p = page if page is not None else 1
        ps = page_size if page_size is not None else 2
        items, total, total_pages, has_next, has_prev = repo.get_published_paginated(page=p, page_size=ps)
        return {
            "items": items,
            "pagination": {
                "page": p,
                "page_size": ps,
                "total": total,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_previous": has_prev,
            },
        }

    return repo.get_published()


@router.get("/{slug}", response_model=ProjectResponse)
def get_project_by_slug(slug: str, db: SessionDep):
    """Retrieve a project by unique slug."""
    repo = ProjectRepository(db)
    project = repo.get_by_slug(slug)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with slug '{slug}' not found",
        )
    return project
