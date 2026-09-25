"""Pydantic schemas for SiteSettings and HomeContent."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SiteSettingsSchema(BaseModel):
    brand_name: str = "Next Aura INNOVATION"
    email: str = "nextaura.innovation@gmail.com"
    domain: str = "nextaura.innovation.com"
    logo: Optional[str] = None
    tagline: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SiteSettingsUpdate(BaseModel):
    brand_name: Optional[str] = None
    email: Optional[str] = None
    domain: Optional[str] = None
    logo: Optional[str] = None
    tagline: Optional[str] = None


class HomeContentSchema(BaseModel):
    hero_headline: str
    hero_description: str
    hero_cta_text: str = "START A PROJECT"
    hero_cta_url: Optional[str] = "/contact"
    about_headline: str = "ABOUT NEXT AURA"
    about_description: str
    about_callout: str
    cta_headline: str = "START A PROJECT"
    cta_description: str
    cta_button_text: str = "START A PROJECT"

    model_config = ConfigDict(from_attributes=True)


class HomeContentUpdate(BaseModel):
    hero_headline: Optional[str] = None
    hero_description: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    about_headline: Optional[str] = None
    about_description: Optional[str] = None
    about_callout: Optional[str] = None
    cta_headline: Optional[str] = None
    cta_description: Optional[str] = None
    cta_button_text: Optional[str] = None
