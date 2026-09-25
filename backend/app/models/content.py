"""SQLAlchemy SiteSettings and HomeContent models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SiteSettings(Base):
    """Studio site configuration."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand_name: Mapped[str] = mapped_column(String(255), default="Next Aura INNOVATION", nullable=False)
    email: Mapped[str] = mapped_column(String(255), default="nextaura.innovation@gmail.com", nullable=False)
    domain: Mapped[str] = mapped_column(String(255), default="nextaura.innovation.com", nullable=False)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    tagline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class HomeContent(Base):
    """Studio homepage editorial content."""

    __tablename__ = "home_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hero_headline: Mapped[str] = mapped_column(Text, nullable=False)
    hero_description: Mapped[str] = mapped_column(Text, nullable=False)
    hero_cta_text: Mapped[str] = mapped_column(String(100), default="START A PROJECT", nullable=False)
    hero_cta_url: Mapped[Optional[str]] = mapped_column(String(255), default="/contact", nullable=True)
    
    about_headline: Mapped[str] = mapped_column(String(255), default="ABOUT NEXT AURA", nullable=False)
    about_description: Mapped[str] = mapped_column(Text, nullable=False)
    about_callout: Mapped[str] = mapped_column(Text, nullable=False)
    
    cta_headline: Mapped[str] = mapped_column(String(255), default="START A PROJECT", nullable=False)
    cta_description: Mapped[str] = mapped_column(Text, nullable=False)
    cta_button_text: Mapped[str] = mapped_column(String(100), default="START A PROJECT", nullable=False)
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
