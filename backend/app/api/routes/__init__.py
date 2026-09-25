"""API endpoint routes aggregation."""

from fastapi import APIRouter
from app.api.routes import (
    admin,
    auth,
    contact,
    health,
    home,
    packages,
    projects,
    services,
    settings,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(home.router)
api_router.include_router(projects.router)
api_router.include_router(projects.router, prefix="/public")
api_router.include_router(services.router)
api_router.include_router(services.router, prefix="/public")
api_router.include_router(packages.router)
api_router.include_router(settings.router)
api_router.include_router(contact.router)
api_router.include_router(auth.router)
api_router.include_router(admin.router)

__all__ = ["api_router"]
