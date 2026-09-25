"""Project Repository."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, db: Session):
        super().__init__(Project, db)

    def get_by_slug(self, slug: str) -> Optional[Project]:
        stmt = select(Project).where(Project.slug == slug)
        return self.db.scalar(stmt)

    def get_published(self) -> List[Project]:
        stmt = select(Project).where(Project.published == True).order_by(Project.order.asc())
        return list(self.db.scalars(stmt).all())

    def get_featured(self) -> List[Project]:
        stmt = select(Project).where(Project.published == True, Project.featured == True).order_by(Project.order.asc())
        return list(self.db.scalars(stmt).all())

    def get_all_ordered(self) -> List[Project]:
        stmt = select(Project).order_by(Project.order.asc(), Project.id.desc())
        return list(self.db.scalars(stmt).all())

    def get_published_paginated(
        self, page: int = 1, page_size: int = 2
    ) -> tuple[List[Project], int, int, bool, bool]:
        """Fetch published projects with pagination metadata."""
        from sqlalchemy import func

        count_stmt = select(func.count()).select_from(Project).where(Project.published == True)
        total = self.db.scalar(count_stmt) or 0

        total_pages = max(1, (total + page_size - 1) // page_size) if total > 0 else 1
        offset = (page - 1) * page_size

        stmt = (
            select(Project)
            .where(Project.published == True)
            .order_by(Project.order.asc(), Project.id.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = list(self.db.scalars(stmt).all())

        has_next = page < total_pages
        has_prev = page > 1

        return items, total, total_pages, has_next, has_prev
