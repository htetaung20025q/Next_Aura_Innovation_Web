"""Next Aura INNOVATION - Main FastAPI Application."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events (startup & shutdown)."""
    # Startup actions: ensure default admin user exists idempotently
    try:
        from sqlalchemy import select
        from app.core.database import SessionLocal
        from app.core.security import get_password_hash
        from app.models.user import AdminUser

        with SessionLocal() as db:
            admin_user = db.scalar(select(AdminUser).where(AdminUser.username == settings.ADMIN_USERNAME))
            if not admin_user:
                admin_user = AdminUser(
                    username=settings.ADMIN_USERNAME,
                    email=settings.ADMIN_EMAIL,
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    is_active=True,
                    is_superuser=True,
                )
                db.add(admin_user)
                db.commit()
            elif not admin_user.is_active:
                admin_user.is_active = True
                db.commit()
    except Exception:
        # Prevent crash if database is not reachable at instant of cold start
        pass

    yield
    # Shutdown actions


def create_application() -> FastAPI:
    """Factory to create and configure the FastAPI application instance."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_PREFIX}/openapi.json" if settings.DEBUG else None,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # Configure CORS middleware
    origins = settings.cors_origins
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in origins] if origins else [],
        allow_origin_regex=settings.CORS_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Register API routers
    application.include_router(api_router, prefix=settings.API_PREFIX)

    # Mount static media directory
    import os
    from fastapi.staticfiles import StaticFiles
    base_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    media_dir = os.path.join(base_backend_dir, "media")
    os.makedirs(media_dir, exist_ok=True)
    for subfolder in ["projects", "services", "packages", "site"]:
        os.makedirs(os.path.join(media_dir, subfolder), exist_ok=True)
    application.mount("/media", StaticFiles(directory=media_dir), name="media")

    # Mount static uploads directory for legacy compatibility
    uploads_dir = os.path.join(base_backend_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    application.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    @application.get("/", tags=["Root"])
    def root() -> dict[str, str]:
        """Root welcome endpoint."""
        return {
            "project": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "status": "online",
            "docs": "/docs",
        }

    return application


app = create_application()
