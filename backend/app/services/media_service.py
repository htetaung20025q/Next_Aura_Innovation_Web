"""Next Aura INNOVATION - Secure Media Management Service."""

import os
import re
import uuid
from typing import Dict, List, Optional, Tuple
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.storage import ALLOWED_CATEGORIES, get_media_storage
from app.models.content import HomeContent, SiteSettings
from app.models.package import Package
from app.models.project import Project
from app.models.service import Service

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_SIGNATURES: Dict[str, Tuple[str, ...]] = {
    "image/jpeg": (".jpg", ".jpeg"),
    "image/png": (".png",),
    "image/webp": (".webp",),
}

EXTENSION_TO_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def validate_image_header(content: bytes) -> str:
    """Verify magic bytes of uploaded image. Returns verified extension."""
    if len(content) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image payload: file content is too short to be a valid image.",
        )

    # Check JPEG
    if content.startswith(b"\xff\xd8\xff"):
        return ".jpg"

    # Check PNG
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"

    # Check WebP (RIFF .... WEBP)
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return ".webp"

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported image format. Allowed formats: JPEG, PNG, WebP.",
    )


def sanitize_filename(original_filename: Optional[str], verified_ext: str) -> str:
    """Generate safe, sanitized unique filename without trusting user input."""
    base_name = "asset"
    if original_filename:
        base = os.path.basename(original_filename)
        stem, _ = os.path.splitext(base)
        cleaned = re.sub(r"[^a-zA-Z0-9_-]", "-", stem).strip("-")
        if cleaned:
            base_name = cleaned[:30]

    unique_token = uuid.uuid4().hex[:10]
    return f"{base_name}-{unique_token}{verified_ext}"


async def save_media_file(file: UploadFile, category: str = "projects") -> dict:
    """Validate, sanitize, and save uploaded media file via the storage abstraction."""
    cat = category.strip().lower()
    if cat not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid media category '{category}'. Allowed: {', '.join(sorted(ALLOWED_CATEGORIES))}",
        )

    # Read file content safely in chunks to enforce size limit
    chunk_size = 64 * 1024  # 64 KB
    total_bytes = 0
    chunks: List[bytes] = []

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 10MB ({MAX_FILE_SIZE} bytes).",
            )
        chunks.append(chunk)

    if total_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    file_bytes = b"".join(chunks)

    # Validate image magic bytes
    verified_ext = validate_image_header(file_bytes)
    content_type = EXTENSION_TO_MIME.get(verified_ext, "image/jpeg")

    # Generate safe unique filename
    safe_filename = sanitize_filename(file.filename, verified_ext)

    # Save via storage abstraction (Local or S3/R2)
    storage = get_media_storage()
    try:
        return storage.save(
            file_bytes=file_bytes,
            filename=safe_filename,
            category=cat,
            content_type=content_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist media asset: {str(e)}",
        )


def find_media_references(media_url: str, db: Session) -> List[str]:
    """Check if a media URL/path is referenced by any CMS entities."""
    references = []
    clean_url = media_url.strip()
    fname = os.path.basename(clean_url.split("?")[0])

    def matches(field_val: Optional[str]) -> bool:
        if not field_val:
            return False
        return clean_url in field_val or (bool(fname) and fname in field_val)

    # Check Projects
    projects = db.query(Project).all()
    for p in projects:
        if matches(p.image_url):
            references.append(f"Project: {p.title} (ID #{p.id})")

    # Check SiteSettings
    settings = db.query(SiteSettings).first()
    if settings and matches(settings.logo):
        references.append("SiteSettings: Logo")

    # Check Services
    services = db.query(Service).all()
    for s in services:
        if matches(s.description) or matches(s.full_description):
            references.append(f"Service: {s.title} (ID #{s.id})")

    # Check Packages
    packages = db.query(Package).all()
    for pkg in packages:
        if matches(pkg.description) or matches(pkg.short_description):
            references.append(f"Package: {pkg.name} (ID #{pkg.id})")

    # Check HomeContent
    home = db.query(HomeContent).first()
    if home:
        for attr in ["hero_description", "about_description"]:
            val = getattr(home, attr, None)
            if matches(val):
                references.append(f"HomeContent: {attr}")

    return references


def list_media_files(db: Session, category: Optional[str] = None) -> List[dict]:
    """List stored media assets with metadata and reference status."""
    storage = get_media_storage()
    items = storage.list_files(category=category)

    for item in items:
        refs = find_media_references(item["url"], db)
        item["in_use"] = len(refs) > 0
        item["references"] = refs

    return items


def delete_media_file(media_url: str, db: Session, force: bool = False) -> dict:
    """Safely delete media file from storage, preventing deletion of referenced files."""
    clean_url = media_url.strip()

    # Reference check
    refs = find_media_references(clean_url, db)
    if refs and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete media: file is currently referenced by {', '.join(refs)}. Please remove or replace the reference first.",
        )

    storage = get_media_storage()
    fname = os.path.basename(clean_url.split("?")[0])
    success = storage.delete(clean_url)
    if not success and not force:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found in storage.",
        )

    return {"status": "deleted", "url": clean_url, "filename": fname}
