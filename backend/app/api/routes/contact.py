"""Public Contact submission routes."""

from fastapi import APIRouter, status
from app.api.dependencies import SessionDep
from app.repositories.contact_repo import ContactRepository
from app.schemas.contact import ContactSubmissionCreate, ContactSubmissionResponse

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_inquiry(inquiry_in: ContactSubmissionCreate, db: SessionDep):
    """Submit a project inquiry or consultation request."""
    repo = ContactRepository(db)
    submission = repo.create(inquiry_in)
    return submission
