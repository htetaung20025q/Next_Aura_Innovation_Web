"""Admin CMS management routes."""

import os
import shutil
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from app.api.dependencies import CurrentUserDep, SessionDep
from app.services.media_service import (
    delete_media_file,
    list_media_files,
    save_media_file,
)
from app.repositories.contact_repo import ContactRepository
from app.repositories.content_repo import ContentRepository
from app.repositories.package_repo import PackageRepository
from app.repositories.project_repo import ProjectRepository
from app.repositories.service_repo import ServiceRepository
from app.schemas.contact import ContactSubmissionResponse, ContactSubmissionUpdate
from app.schemas.content import (
    HomeContentSchema,
    HomeContentUpdate,
    SiteSettingsSchema,
    SiteSettingsUpdate,
)
from app.schemas.package import PackageCreate, PackageResponse, PackageUpdate
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate

from app.api.routes.auth import login as auth_login
from app.schemas.auth import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/admin", tags=["Admin CMS"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/auth/login", response_model=Token, tags=["Auth"])
def admin_auth_login_alias(login_in: LoginRequest, db: SessionDep):
    """Alias for POST /api/auth/login under /api/admin/auth/login."""
    return auth_login(login_in=login_in, db=db)


@router.post("/login", response_model=Token, tags=["Auth"])
def admin_login_alias(login_in: LoginRequest, db: SessionDep):
    """Alias for POST /api/auth/login under /api/admin/login."""
    return auth_login(login_in=login_in, db=db)


@router.get("/me", response_model=UserResponse, tags=["Auth"])
def admin_me_alias(current_user: CurrentUserDep):
    """Alias for GET /api/auth/me under /api/admin/me."""
    return current_user



class DashboardStats(BaseModel):
    projects_count: int
    published_projects_count: int
    services_count: int
    packages_count: int
    inquiries_count: int
    new_inquiries_count: int


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: CurrentUserDep, db: SessionDep):
    """Retrieve operational telemetry and entity statistics for CMS dashboard."""
    contact_repo = ContactRepository(db)
    project_repo = ProjectRepository(db)
    service_repo = ServiceRepository(db)
    package_repo = PackageRepository(db)

    all_projects = project_repo.get_all(limit=1000)
    published_projects = [p for p in all_projects if p.published]
    all_inquiries = contact_repo.get_all(limit=1000)
    new_inquiries = [i for i in all_inquiries if i.status == "new"]

    return {
        "projects_count": len(all_projects),
        "published_projects_count": len(published_projects),
        "services_count": len(service_repo.get_all(limit=1000)),
        "packages_count": len(package_repo.get_all(limit=1000)),
        "inquiries_count": len(all_inquiries),
        "new_inquiries_count": len(new_inquiries),
    }


# --- Inquiries Management ---
@router.get("/inquiries", response_model=List[ContactSubmissionResponse])
def get_inquiries(current_user: CurrentUserDep, db: SessionDep, skip: int = 0, limit: int = 50):
    """List client inquiries."""
    repo = ContactRepository(db)
    return repo.get_recent(skip=skip, limit=limit)


@router.patch("/inquiries/{id}", response_model=ContactSubmissionResponse)
def update_inquiry_status(id: int, update_in: ContactSubmissionUpdate, current_user: CurrentUserDep, db: SessionDep):
    """Update status of a contact inquiry."""
    repo = ContactRepository(db)
    submission = repo.update_status(id, update_in.status)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return submission


# --- Projects CRUD ---
@router.get("/projects", response_model=List[ProjectResponse])
def get_all_projects(current_user: CurrentUserDep, db: SessionDep):
    """Retrieve all projects (including drafts/unpublished) for admin management."""
    repo = ProjectRepository(db)
    return repo.get_all_ordered()


@router.get("/projects/{id}", response_model=ProjectResponse)
def get_project_by_id(id: int, current_user: CurrentUserDep, db: SessionDep):
    repo = ProjectRepository(db)
    project = repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, current_user: CurrentUserDep, db: SessionDep):
    repo = ProjectRepository(db)
    if repo.get_by_slug(project_in.slug):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Slug '{project_in.slug}' already in use")
    return repo.create(project_in)


@router.put("/projects/{id}", response_model=ProjectResponse)
def update_project(id: int, project_in: ProjectUpdate, current_user: CurrentUserDep, db: SessionDep):
    repo = ProjectRepository(db)
    project = repo.get_by_id(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project_in.slug and project_in.slug != project.slug:
        existing = repo.get_by_slug(project_in.slug)
        if existing and existing.id != id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Slug '{project_in.slug}' already in use")
    return repo.update(project, project_in)


@router.delete("/projects/{id}", response_model=ProjectResponse)
def delete_project(id: int, current_user: CurrentUserDep, db: SessionDep):
    repo = ProjectRepository(db)
    project = repo.delete(id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


# --- Services CRUD ---
@router.get("/services", response_model=List[ServiceResponse])
def get_all_services(current_user: CurrentUserDep, db: SessionDep):
    repo = ServiceRepository(db)
    return repo.get_all_ordered()


@router.get("/services/{id}", response_model=ServiceResponse)
def get_service_by_id(id: int, current_user: CurrentUserDep, db: SessionDep):
    repo = ServiceRepository(db)
    service = repo.get_by_id(id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.post("/services", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(service_in: ServiceCreate, current_user: CurrentUserDep, db: SessionDep):
    repo = ServiceRepository(db)
    if repo.get_by_slug(service_in.slug):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Slug '{service_in.slug}' already in use")
    return repo.create(service_in)


@router.put("/services/{id}", response_model=ServiceResponse)
def update_service(id: int, service_in: ServiceUpdate, current_user: CurrentUserDep, db: SessionDep):
    repo = ServiceRepository(db)
    service = repo.get_by_id(id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if service_in.slug and service_in.slug != service.slug:
        existing = repo.get_by_slug(service_in.slug)
        if existing and existing.id != id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Slug '{service_in.slug}' already in use")
    return repo.update(service, service_in)


@router.delete("/services/{id}", response_model=ServiceResponse)
def delete_service(id: int, current_user: CurrentUserDep, db: SessionDep):
    repo = ServiceRepository(db)
    service = repo.delete(id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


# --- Packages CRUD ---
@router.get("/packages", response_model=List[PackageResponse])
def get_all_packages(current_user: CurrentUserDep, db: SessionDep):
    repo = PackageRepository(db)
    return repo.get_all_ordered()


@router.get("/packages/{id}", response_model=PackageResponse)
def get_package_by_id(id: int, current_user: CurrentUserDep, db: SessionDep):
    repo = PackageRepository(db)
    pkg = repo.get_by_id(id)
    if not pkg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return pkg


@router.post("/packages", response_model=PackageResponse, status_code=status.HTTP_201_CREATED)
def create_package(package_in: PackageCreate, current_user: CurrentUserDep, db: SessionDep):
    repo = PackageRepository(db)
    if repo.get_by_slug(package_in.slug):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Slug '{package_in.slug}' already in use")
    return repo.create(package_in)


@router.put("/packages/{id}", response_model=PackageResponse)
def update_package(id: int, package_in: PackageUpdate, current_user: CurrentUserDep, db: SessionDep):
    repo = PackageRepository(db)
    package = repo.get_by_id(id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return repo.update(package, package_in)


@router.delete("/packages/{id}", response_model=PackageResponse)
def delete_package(id: int, current_user: CurrentUserDep, db: SessionDep):
    repo = PackageRepository(db)
    package = repo.delete(id)
    if not package:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return package


# --- Settings & Home Content ---
@router.get("/settings", response_model=SiteSettingsSchema)
def get_admin_settings(current_user: CurrentUserDep, db: SessionDep):
    repo = ContentRepository(db)
    return repo.get_settings()


@router.put("/settings", response_model=SiteSettingsSchema)
def update_site_settings(settings_in: SiteSettingsUpdate, current_user: CurrentUserDep, db: SessionDep):
    repo = ContentRepository(db)
    return repo.update_settings(settings_in.model_dump(exclude_unset=True))


@router.get("/home", response_model=HomeContentSchema)
def get_admin_home_content(current_user: CurrentUserDep, db: SessionDep):
    repo = ContentRepository(db)
    return repo.get_home_content()


@router.put("/home", response_model=HomeContentSchema)
def update_home_content(content_in: HomeContentUpdate, current_user: CurrentUserDep, db: SessionDep):
    repo = ContentRepository(db)
    return repo.update_home_content(content_in.model_dump(exclude_unset=True))


# --- Media Management & File Upload ---
@router.post("/media/upload")
async def upload_media_file(
    current_user: CurrentUserDep,
    file: UploadFile = File(...),
    category: str = Form("projects"),
):
    """Securely upload an image asset into partitioned media storage (projects, services, packages, site)."""
    return await save_media_file(file=file, category=category)


@router.post("/upload")
async def legacy_upload_image(
    current_user: CurrentUserDep,
    file: UploadFile = File(...),
    category: str = Form("projects"),
):
    """Legacy upload route for backward compatibility."""
    return await save_media_file(file=file, category=category)


@router.get("/media")
def get_media_library(
    current_user: CurrentUserDep,
    db: SessionDep,
    category: Optional[str] = None,
):
    """Retrieve catalog of uploaded media assets with storage metadata and reference status."""
    return list_media_files(db=db, category=category)


@router.delete("/media")
def remove_media_file(
    current_user: CurrentUserDep,
    db: SessionDep,
    url: str = Query(...),
    force: bool = Query(False),
):
    """Delete uploaded media asset, verifying that no live entity is referencing it."""
    return delete_media_file(media_url=url, db=db, force=force)
