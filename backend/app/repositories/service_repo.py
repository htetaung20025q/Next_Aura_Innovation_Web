"""Service Repository."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.service import Service
from app.repositories.base import BaseRepository


class ServiceRepository(BaseRepository[Service]):
    def __init__(self, db: Session):
        super().__init__(Service, db)

    def get_by_slug(self, slug: str) -> Optional[Service]:
        stmt = select(Service).where(Service.slug == slug)
        return self.db.scalar(stmt)

    def get_active(self) -> List[Service]:
        stmt = select(Service).where(Service.active == True).order_by(Service.order.asc())
        return list(self.db.scalars(stmt).all())

    def get_all_ordered(self) -> List[Service]:
        stmt = select(Service).order_by(Service.order.asc(), Service.id.desc())
        return list(self.db.scalars(stmt).all())
