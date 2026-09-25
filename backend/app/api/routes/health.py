"""Health check endpoint route."""

from fastapi import APIRouter, Response, status
from sqlalchemy import text
from app.api.dependencies import SessionDep
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(db: SessionDep, response: Response) -> dict[str, str]:
    """Health check endpoint to verify backend and database availability."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
    }
