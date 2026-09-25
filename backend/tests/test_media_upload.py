"""Comprehensive test suite for Media Upload Architecture."""

import io
import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Minimal valid 1x1 image byte payloads
# Valid PNG 1x1 pixel
TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02"
    b"\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
)

# Valid JPEG header
TINY_JPEG = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00"
    b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
    b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xda\x00"
    b"\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
)

# Valid WebP header
TINY_WEBP = (
    b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00/0\x00\x000\x00"
    b"\x00\x00\x00\x00\x00\x00\x00\x00"
)


@pytest.fixture(scope="module")
def admin_headers():
    login_res = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "NextAura2026!Secure"},
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_upload_rejected():
    """Verify that unauthenticated upload requests are rejected with 401."""
    files = {"file": ("test.png", io.BytesIO(TINY_PNG), "image/png")}
    res = client.post("/api/admin/media/upload", files=files)
    assert res.status_code == 401


def test_valid_image_upload_and_serving(admin_headers):
    """Test uploading a valid WebP image to projects category and accessing it via /media URL."""
    files = {"file": ("rubis-cover.webp", io.BytesIO(TINY_WEBP), "image/webp")}
    data = {"category": "projects"}

    res = client.post("/api/admin/media/upload", files=files, data=data, headers=admin_headers)
    assert res.status_code == 200, f"Upload failed: {res.text}"

    body = res.json()
    assert "url" in body
    assert body["category"] == "projects"
    assert body["url"].startswith("/media/projects/")
    assert body["filename"].endswith(".webp")

    media_url = body["url"]

    # Verify file is served via static media mount
    static_res = client.get(media_url)
    assert static_res.status_code == 200
    assert static_res.content == TINY_WEBP


def test_invalid_file_type_rejected(admin_headers):
    """Verify that non-image or executable files are rejected with 400."""
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"
    files = {"file": ("malicious.exe", io.BytesIO(fake_exe), "application/octet-stream")}
    res = client.post("/api/admin/media/upload", files=files, headers=admin_headers)
    assert res.status_code == 400
    assert "Unsupported image format" in res.json()["detail"]


def test_oversized_file_rejected(admin_headers):
    """Verify that files exceeding 10MB are rejected with 400."""
    # Create fake oversized payload with PNG header followed by 10MB + 1KB
    oversized = io.BytesIO(TINY_PNG + (b"\x00" * (10 * 1024 * 1024 + 1024)))
    files = {"file": ("huge.png", oversized, "image/png")}
    res = client.post("/api/admin/media/upload", files=files, headers=admin_headers)
    assert res.status_code == 400
    assert "exceeds maximum allowed size" in res.json()["detail"]


def test_invalid_category_or_traversal(admin_headers):
    """Verify invalid categories or directory traversal attempts are blocked."""
    files = {"file": ("test.png", io.BytesIO(TINY_PNG), "image/png")}
    data = {"category": "../../etc"}
    res = client.post("/api/admin/media/upload", files=files, data=data, headers=admin_headers)
    assert res.status_code == 400
    assert "Invalid media category" in res.json()["detail"]


def test_media_library_and_safe_delete_lifecycle(admin_headers):
    """Verify complete media listing, reference locking, and deletion lifecycle."""
    # 1. Upload temporary image
    files = {"file": ("temp-asset.png", io.BytesIO(TINY_PNG), "image/png")}
    upload_res = client.post(
        "/api/admin/media/upload",
        files=files,
        data={"category": "projects"},
        headers=admin_headers,
    )
    assert upload_res.status_code == 200
    uploaded_url = upload_res.json()["url"]

    # 2. Verify it appears in media listing
    list_res = client.get("/api/admin/media", headers=admin_headers)
    assert list_res.status_code == 200
    urls = [m["url"] for m in list_res.json()]
    assert uploaded_url in urls

    # 3. Create a project referencing this media URL
    test_slug = "media-ref-test-project"
    create_proj = client.post(
        "/api/admin/projects",
        json={
            "title": "Media Reference Test",
            "slug": test_slug,
            "category": "Test",
            "description": "Test description",
            "image_url": uploaded_url,
            "order": 99,
        },
        headers=admin_headers,
    )
    assert create_proj.status_code == 201
    proj_id = create_proj.json()["id"]

    # 4. Try deleting the media while referenced -> must be blocked with 409 Conflict
    del_res = client.delete(f"/api/admin/media?url={uploaded_url}", headers=admin_headers)
    assert del_res.status_code == 409
    assert "referenced by" in del_res.json()["detail"]

    # 5. Clean up project
    del_proj = client.delete(f"/api/admin/projects/{proj_id}", headers=admin_headers)
    assert del_proj.status_code == 200

    # 6. Now delete unreferenced media -> must succeed with 200 OK
    del_media_res = client.delete(f"/api/admin/media?url={uploaded_url}", headers=admin_headers)
    assert del_media_res.status_code == 200

    # 7. Verify file is gone from static serving
    check_static = client.get(uploaded_url)
    assert check_static.status_code == 404
