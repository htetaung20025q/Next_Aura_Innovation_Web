"""Application configuration using Pydantic Settings."""

from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    # Project Information
    PROJECT_NAME: str = "Next Aura INNOVATION"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    # CORS Settings
    CORS_ORIGINS: Union[str, List[str], None] = None
    CORS_ORIGIN_REGEX: Optional[str] = r"^https:\/\/(?:[a-zA-Z0-9-]+\.)*vercel\.app$"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str], None]) -> List[str]:
        """Allow origins to be provided as JSON array or comma-separated string."""
        if v is None:
            return []
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json

                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    @property
    def cors_origins(self) -> List[str]:
        """Returns the effective list of allowed CORS origins."""
        if self.CORS_ORIGINS:
            return self.assemble_cors_origins(self.CORS_ORIGINS)
        return self.BACKEND_CORS_ORIGINS

    # PostgreSQL Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_password"
    POSTGRES_DB: str = "next_aura_db"
    DATABASE_URL: Union[str, None] = None

    @property
    def sync_database_url(self) -> str:
        """Returns the PostgreSQL connection URL with psycopg2 driver normalization."""
        if self.DATABASE_URL:
            raw_url = self.DATABASE_URL.strip()
            # Standardize postgres:// to postgresql+psycopg2:// for SQLAlchemy compatibility
            if raw_url.startswith("postgres://"):
                return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
            if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+psycopg2://"):
                return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return raw_url
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Security & Authentication Settings
    SECRET_KEY: str = "dev-secret-key-change-in-production-next-aura-innovation-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # Default Admin Credentials (auto-seeded on startup if database is empty)
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "NextAura2026!Secure"
    ADMIN_EMAIL: str = "admin@nextaurainnovation.com"

    # Media Storage Configuration
    MEDIA_STORAGE_PROVIDER: str = "local"  # "local", "s3", "r2", "supabase"
    MEDIA_BASE_URL: Union[str, None] = None  # Optional public CDN/base URL

    # Production Object Storage Settings (S3 / R2 / Supabase / MinIO)
    S3_BUCKET_NAME: Union[str, None] = None
    S3_ENDPOINT_URL: Union[str, None] = None
    S3_REGION_NAME: str = "us-east-1"
    S3_ACCESS_KEY_ID: Union[str, None] = None
    S3_SECRET_ACCESS_KEY: Union[str, None] = None
    S3_PUBLIC_URL_PREFIX: Union[str, None] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
