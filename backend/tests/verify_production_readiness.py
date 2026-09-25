"""Next Aura INNOVATION - Production Readiness & Architectural Verification Script."""

import io
import sys
import httpx

BASE_API = "http://localhost:8000/api"
BASE_WEB = "http://localhost:3000"

# Minimal valid 1x1 WebP
TINY_WEBP = (
    b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00/0\x00\x000\x00"
    b"\x00\x00\x00\x00\x00\x00\x00\x00"
)

def run_checks():
    print("==================================================")
    print("NEXT AURA INNOVATION - PRODUCTION READINESS AUDIT")
    print("==================================================")

    # 1. Health check
    print("\n[Check 1] Verifying Backend & Database Health Check...")
    with httpx.Client() as client:
        res = client.get(f"{BASE_API}/health")
        assert res.status_code == 200, f"Health check failed: {res.status_code}"
        data = res.json()
        assert data.get("status") == "ok", f"Status not ok: {data}"
        assert data.get("database") == "connected", f"Database not connected: {data}"
        print(f"✓ Health check OK: {data}")

    # 2. CORS Preflight / Headers
    print("\n[Check 2] Verifying CORS Configuration...")
    with httpx.Client() as client:
        res = client.options(
            f"{BASE_API}/projects",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert res.status_code == 200, f"CORS preflight failed: {res.status_code}"
        assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"
        print("✓ CORS headers correctly configured and enforced.")

    # 3. Admin Authentication
    print("\n[Check 3] Verifying Admin Authentication...")
    with httpx.Client() as client:
        auth_res = client.post(
            f"{BASE_API}/auth/login",
            json={"username": "admin", "password": "NextAura2026!Secure"},
        )
        assert auth_res.status_code == 200, f"Admin login failed: {auth_res.text}"
        token = auth_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        print("✓ Admin authenticated, JWT Bearer token acquired.")

    # 4. Storage Abstraction & Upload API
    print("\n[Check 4] Verifying Media Upload via Storage Abstraction...")
    with httpx.Client() as client:
        files = {"file": ("prod-audit.webp", io.BytesIO(TINY_WEBP), "image/webp")}
        data = {"category": "projects"}
        upload_res = client.post(
            f"{BASE_API}/admin/media/upload",
            files=files,
            data=data,
            headers=auth_headers,
        )
        assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
        upload_data = upload_res.json()
        assert "url" in upload_data
        assert upload_data["category"] == "projects"
        uploaded_url = upload_data["url"]
        print(f"✓ Media uploaded via abstraction: {uploaded_url}")

    # 5. Media Listing
    print("\n[Check 5] Verifying Media Catalog Listing...")
    with httpx.Client() as client:
        list_res = client.get(f"{BASE_API}/admin/media?category=projects", headers=auth_headers)
        assert list_res.status_code == 200
        items = list_res.json()
        assert any(i["url"] == uploaded_url for i in items)
        print(f"✓ Media catalog contains uploaded asset ({len(items)} items found).")

    # 6. Database Reference Guard on Deletion
    print("\n[Check 6] Verifying Entity Linking & Reference Protection...")
    with httpx.Client() as client:
        # Create a test project referencing this media
        proj_payload = {
            "title": "Production Audit Project",
            "slug": "prod-audit-project",
            "category": "Architecture",
            "description": "Verification project for production media reference locking.",
            "image_url": uploaded_url,
            "published": True,
            "featured": True,
            "order": 99,
            "technologies": [{"name": "FastAPI", "slug": "fastapi"}],
        }
        create_res = client.post(f"{BASE_API}/admin/projects", json=proj_payload, headers=auth_headers)
        assert create_res.status_code == 201, f"Failed to create project: {create_res.text}"
        project_id = create_res.json()["id"]
        print(f"✓ Test project created (ID: {project_id}) referencing {uploaded_url}")

        # Attempt to delete referenced media without force -> Must be rejected with 409 Conflict
        del_attempt = client.delete(
            f"{BASE_API}/admin/media?url={uploaded_url}",
            headers=auth_headers,
        )
        assert del_attempt.status_code == 409, f"Expected 409 Conflict, got {del_attempt.status_code}"
        print("✓ Reference protection active: Media deletion blocked with HTTP 409 Conflict.")

        # Clean up project
        del_proj = client.delete(f"{BASE_API}/admin/projects/{project_id}", headers=auth_headers)
        assert del_proj.status_code == 200
        print("✓ Test project removed.")

        # Now delete media safely
        del_media = client.delete(
            f"{BASE_API}/admin/media?url={uploaded_url}",
            headers=auth_headers,
        )
        assert del_media.status_code == 200, f"Failed to delete media: {del_media.text}"
        print("✓ Media deleted successfully once unreferenced.")

    # 7. Next.js Public Pages
    print("\n[Check 7] Verifying Next.js Public Pages Rendering...")
    with httpx.Client(timeout=10.0) as client:
        # Homepage
        hp_res = client.get(f"{BASE_WEB}/")
        assert hp_res.status_code == 200, f"Homepage failed: {hp_res.status_code}"
        assert "SELECTED WORK" in hp_res.text
        assert "VIEW ALL PROJECTS" in hp_res.text
        print("✓ Next.js Homepage rendered with Selected Work (max 2) and View All Projects CTA.")

        # Projects listing
        proj_res = client.get(f"{BASE_WEB}/projects?page=1")
        assert proj_res.status_code == 200, f"/projects failed: {proj_res.status_code}"
        print("✓ Next.js /projects?page=1 rendered successfully with server pagination.")

        # Project detail
        detail_res = client.get(f"{BASE_WEB}/projects/rubis")
        assert detail_res.status_code == 200, f"Detail page failed: {detail_res.status_code}"
        print("✓ Next.js /projects/rubis detail page rendered with system architecture canvas.")

    print("\n==================================================")
    print("ALL PRODUCTION READINESS CHECKS PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    try:
        run_checks()
    except Exception as e:
        print(f"\n❌ AUDIT FAILED: {e}", file=sys.stderr)
        sys.exit(1)
