"""Content and Settings Repository."""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.content import HomeContent, SiteSettings
from app.repositories.base import BaseRepository


class ContentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_settings(self) -> SiteSettings:
        stmt = select(SiteSettings).limit(1)
        settings = self.db.scalar(stmt)
        if not settings:
            settings = SiteSettings()
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def update_settings(self, obj_in: dict) -> SiteSettings:
        settings = self.get_settings()
        for k, v in obj_in.items():
            if v is not None and hasattr(settings, k):
                setattr(settings, k, v)
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def get_home_content(self) -> HomeContent:
        stmt = select(HomeContent).limit(1)
        content = self.db.scalar(stmt)
        if not content:
            content = HomeContent(
                hero_headline="WE BUILD\nDIGITAL SYSTEMS\nFOR REAL\nBUSINESS.",
                hero_description="Websites · E-Commerce · ERP · Business Systems · Custom Software",
                about_headline="ABOUT NEXT AURA",
                about_description="Next Aura Innovation is an engineering-driven digital product studio.",
                about_callout="“Not just a website. A digital system built around how your business works.”",
                cta_headline="START A PROJECT",
                cta_description="Tell us about your project, timeline, and goals. Let’s build something real together.",
            )
            self.db.add(content)
            self.db.commit()
            self.db.refresh(content)
        return content

    def update_home_content(self, obj_in: dict) -> HomeContent:
        content = self.get_home_content()
        for k, v in obj_in.items():
            if v is not None and hasattr(content, k):
                setattr(content, k, v)
        self.db.add(content)
        self.db.commit()
        self.db.refresh(content)
        return content
