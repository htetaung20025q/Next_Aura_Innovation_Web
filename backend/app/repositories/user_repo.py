"""Admin User Repository."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import AdminUser
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[AdminUser]):
    def __init__(self, db: Session):
        super().__init__(AdminUser, db)

    def get_by_username(self, username: str) -> Optional[AdminUser]:
        stmt = select(AdminUser).where(AdminUser.username == username)
        return self.db.scalar(stmt)

    def get_by_email(self, email: str) -> Optional[AdminUser]:
        stmt = select(AdminUser).where(AdminUser.email == email)
        return self.db.scalar(stmt)
