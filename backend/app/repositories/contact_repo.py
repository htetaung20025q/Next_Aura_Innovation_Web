"""Contact Inquiries Repository."""

from typing import List, Optional
from sqlalchemy import desc, select
from sqlalchemy.orm import Session
from app.models.contact import ContactSubmission
from app.repositories.base import BaseRepository


class ContactRepository(BaseRepository[ContactSubmission]):
    def __init__(self, db: Session):
        super().__init__(ContactSubmission, db)

    def get_recent(self, skip: int = 0, limit: int = 50) -> List[ContactSubmission]:
        stmt = (
            select(ContactSubmission)
            .order_by(desc(ContactSubmission.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def update_status(self, id: int, status: str) -> Optional[ContactSubmission]:
        submission = self.get_by_id(id)
        if submission:
            submission.status = status
            self.db.add(submission)
            self.db.commit()
            self.db.refresh(submission)
        return submission
