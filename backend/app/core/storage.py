"""Next Aura INNOVATION - Pluggable Media Storage Abstraction.

Supports:
- LocalMediaStorage: Local filesystem development and persistent volume storage.
- S3MediaStorage: Production Cloud Object Storage (AWS S3, Cloudflare R2, Supabase Storage, MinIO).
"""

from abc import ABC, abstractmethod
import logging
import os
import re
from typing import Dict, List, Optional
from urllib.parse import urlparse

from app.core.config import settings

logger = logging.getLogger("next_aura.storage")

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOCAL_MEDIA_DIR = os.path.join(BACKEND_DIR, "media")
ALLOWED_CATEGORIES = {"projects", "services", "packages", "site"}


class BaseMediaStorage(ABC):
    """Abstract base class for media storage providers."""

    @abstractmethod
    def save(
        self,
        file_bytes: bytes,
        filename: str,
        category: str = "projects",
        content_type: str = "image/jpeg",
    ) -> Dict[str, any]:
        """Save file bytes into storage and return metadata with public URL."""
        pass

    @abstractmethod
    def delete(self, media_url_or_key: str) -> bool:
        """Delete media asset from storage by URL or key."""
        pass

    @abstractmethod
    def list_files(self, category: Optional[str] = None) -> List[Dict[str, any]]:
        """List stored assets in a category or across all categories."""
        pass

    @abstractmethod
    def get_public_url(self, category: str, filename: str) -> str:
        """Generate the public HTTPS URL for an asset."""
        pass


class LocalMediaStorage(BaseMediaStorage):
    """Local filesystem storage provider for development and server volumes."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or LOCAL_MEDIA_DIR
        self._ensure_directories()

    def _ensure_directories(self) -> None:
        os.makedirs(self.base_dir, exist_ok=True)
        for cat in ALLOWED_CATEGORIES:
            os.makedirs(os.path.join(self.base_dir, cat), exist_ok=True)

    def get_public_url(self, category: str, filename: str) -> str:
        relative_path = f"/media/{category}/{filename}"
        if settings.MEDIA_BASE_URL:
            clean_base = settings.MEDIA_BASE_URL.rstrip("/")
            return f"{clean_base}{relative_path}"
        return relative_path

    def save(
        self,
        file_bytes: bytes,
        filename: str,
        category: str = "projects",
        content_type: str = "image/jpeg",
    ) -> Dict[str, any]:
        cat = category.strip().lower()
        if cat not in ALLOWED_CATEGORIES:
            cat = "projects"

        self._ensure_directories()
        category_folder = os.path.realpath(os.path.join(self.base_dir, cat))
        target_path = os.path.realpath(os.path.join(category_folder, filename))

        # Path traversal guard
        if not target_path.startswith(category_folder + os.path.sep):
            raise ValueError("Security violation: Path traversal attempt detected.")

        with open(target_path, "wb") as f:
            f.write(file_bytes)

        public_url = self.get_public_url(cat, filename)
        return {
            "url": public_url,
            "filename": filename,
            "category": cat,
            "size": len(file_bytes),
        }

    def delete(self, media_url_or_key: str) -> bool:
        clean = media_url_or_key.strip()
        # Parse /media/{category}/{filename} or full URL with /media/
        parsed = urlparse(clean)
        path = parsed.path if parsed.path else clean
        match = re.search(r"/media/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_.-]+)$", path)
        if not match:
            return False

        cat, fname = match.groups()
        category_folder = os.path.realpath(os.path.join(self.base_dir, cat))
        target_path = os.path.realpath(os.path.join(category_folder, fname))

        if not target_path.startswith(category_folder + os.path.sep):
            return False

        if os.path.exists(target_path):
            try:
                os.remove(target_path)
                return True
            except OSError as e:
                logger.error(f"Error removing file {target_path}: {e}")
                return False
        return False

    def list_files(self, category: Optional[str] = None) -> List[Dict[str, any]]:
        self._ensure_directories()
        categories = (
            [category]
            if category and category in ALLOWED_CATEGORIES
            else sorted(list(ALLOWED_CATEGORIES))
        )
        items = []

        for cat in categories:
            folder = os.path.join(self.base_dir, cat)
            if not os.path.exists(folder):
                continue
            for fname in os.listdir(folder):
                if fname.startswith("."):
                    continue
                file_path = os.path.join(folder, fname)
                if not os.path.isfile(file_path):
                    continue
                try:
                    stat = os.stat(file_path)
                    items.append({
                        "filename": fname,
                        "category": cat,
                        "url": self.get_public_url(cat, fname),
                        "size": stat.st_size,
                        "created_at": stat.st_mtime,
                    })
                except OSError:
                    continue

        items.sort(key=lambda x: x["created_at"], reverse=True)
        return items


class S3MediaStorage(BaseMediaStorage):
    """Production S3-compatible object storage provider (AWS S3, Cloudflare R2, Supabase, MinIO)."""

    def __init__(
        self,
        bucket_name: str,
        access_key_id: str,
        secret_access_key: str,
        region_name: str = "us-east-1",
        endpoint_url: Optional[str] = None,
        public_url_prefix: Optional[str] = None,
    ):
        self.bucket_name = bucket_name
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.region_name = region_name or "us-east-1"
        self.endpoint_url = endpoint_url
        self.public_url_prefix = public_url_prefix

        try:
            import boto3
            from botocore.config import Config

            client_config = Config(
                signature_version="s3v4",
                retries={"max_attempts": 3, "mode": "standard"},
            )
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                region_name=self.region_name,
                endpoint_url=self.endpoint_url,
                config=client_config,
            )
        except ImportError:
            logger.error("boto3 is required for S3MediaStorage. Please install boto3.")
            raise RuntimeError("boto3 package is not installed.")

    def get_public_url(self, category: str, filename: str) -> str:
        key = f"{category}/{filename}"
        if self.public_url_prefix:
            clean_prefix = self.public_url_prefix.rstrip("/")
            return f"{clean_prefix}/{key}"
        if self.endpoint_url:
            clean_endpoint = self.endpoint_url.rstrip("/")
            return f"{clean_endpoint}/{self.bucket_name}/{key}"
        return f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key}"

    def _extract_key(self, media_url_or_key: str) -> Optional[str]:
        clean = media_url_or_key.strip()
        parsed = urlparse(clean)
        path = parsed.path if parsed.path else clean
        # Match category/filename
        match = re.search(r"(?:/media/|^|/)(projects|services|packages|site)/([a-zA-Z0-9_.-]+)$", path)
        if match:
            cat, fname = match.groups()
            return f"{cat}/{fname}"
        return None

    def save(
        self,
        file_bytes: bytes,
        filename: str,
        category: str = "projects",
        content_type: str = "image/jpeg",
    ) -> Dict[str, any]:
        cat = category.strip().lower()
        if cat not in ALLOWED_CATEGORIES:
            cat = "projects"

        key = f"{cat}/{filename}"
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
        except Exception as e:
            logger.error(f"S3 upload failed for key {key}: {e}")
            raise RuntimeError(f"Failed to upload media to object storage: {str(e)}")

        public_url = self.get_public_url(cat, filename)
        return {
            "url": public_url,
            "filename": filename,
            "category": cat,
            "size": len(file_bytes),
        }

    def delete(self, media_url_or_key: str) -> bool:
        key = self._extract_key(media_url_or_key)
        if not key:
            return False

        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception as e:
            logger.error(f"S3 delete failed for key {key}: {e}")
            return False

    def list_files(self, category: Optional[str] = None) -> List[Dict[str, any]]:
        prefix = f"{category}/" if category and category in ALLOWED_CATEGORIES else ""
        items = []

        try:
            paginator = self.s3_client.get_paginator("list_objects_v2")
            for page in paginator.paginate(Bucket=self.bucket_name, Prefix=prefix):
                for obj in page.get("Contents", []):
                    key = obj.get("Key", "")
                    parts = key.split("/")
                    if len(parts) >= 2 and parts[0] in ALLOWED_CATEGORIES:
                        cat = parts[0]
                        fname = "/".join(parts[1:])
                        last_modified = obj.get("LastModified")
                        timestamp = last_modified.timestamp() if last_modified else 0.0
                        items.append({
                            "filename": fname,
                            "category": cat,
                            "url": self.get_public_url(cat, fname),
                            "size": obj.get("Size", 0),
                            "created_at": timestamp,
                        })
        except Exception as e:
            logger.error(f"S3 list_objects_v2 failed: {e}")
            return []

        items.sort(key=lambda x: x["created_at"], reverse=True)
        return items


def get_media_storage() -> BaseMediaStorage:
    """Storage factory that returns configured media storage provider."""
    provider = (settings.MEDIA_STORAGE_PROVIDER or "local").lower().strip()

    if provider in ("s3", "r2", "supabase", "production"):
        if (
            not settings.S3_BUCKET_NAME
            or not settings.S3_ACCESS_KEY_ID
            or not settings.S3_SECRET_ACCESS_KEY
        ):
            logger.warning(
                "S3/R2 storage provider configured ('%s') but missing required credentials "
                "(S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY). "
                "Falling back safely to LocalMediaStorage for local execution.",
                provider,
            )
            return LocalMediaStorage()

        return S3MediaStorage(
            bucket_name=settings.S3_BUCKET_NAME,
            access_key_id=settings.S3_ACCESS_KEY_ID,
            secret_access_key=settings.S3_SECRET_ACCESS_KEY,
            region_name=settings.S3_REGION_NAME,
            endpoint_url=settings.S3_ENDPOINT_URL,
            public_url_prefix=settings.S3_PUBLIC_URL_PREFIX or settings.MEDIA_BASE_URL,
        )

    return LocalMediaStorage()
