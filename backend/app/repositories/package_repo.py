"""Package Repository."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.package import Package
from app.repositories.base import BaseRepository


class PackageRepository(BaseRepository[Package]):
    def __init__(self, db: Session):
        super().__init__(Package, db)

    def get_by_slug(self, slug: str) -> Optional[Package]:
        stmt = select(Package).where(Package.slug == slug)
        return self.db.scalar(stmt)

    def get_active(self) -> List[Package]:
        stmt = select(Package).where(Package.is_active == True).order_by(Package.sort_order.asc())
        return list(self.db.scalars(stmt).all())

    def get_all_ordered(self) -> List[Package]:
        stmt = select(Package).order_by(Package.sort_order.asc(), Package.id.desc())
        return list(self.db.scalars(stmt).all())
