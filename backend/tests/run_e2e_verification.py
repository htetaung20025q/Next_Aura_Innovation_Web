"""End-to-End Verification Script for Media Upload Architecture."""

import io
import os
import httpx
import json

BASE_API = "http://localhost:8000/api"
BASE_WEB = "http://localhost:3000"

TINY_WEBP = (
    b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00/0\x00\x000\x00"
    b"\x00\x00\x00\x00\x00\x00\x00\x00"
)

TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02"
    b"\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
)


def run_all_checks():
    print("=== STARTING COMPLETE E2E VERIFICATION ===")
    client = httpx.Client(timeout=30.0)

    # 1. Login to Admin
    print("\n[Step 1] Logging into Admin Portal...")
    login_res = client.post(f"{BASE_API}/auth/login", json={"username": "admin", "password": "NextAura2026!Secure"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Successfully authenticated. Token received.")

    # 2. Open Projects
    print("\n[Step 2] Retrieving Projects list from Admin API...")
    projects_res = client.get(f"{BASE_API}/admin/projects", headers=headers)
    assert projects_res.status_code == 200
    initial_projects = projects_res.json()
    print(f"✓ Retrieved {len(initial_projects)} projects currently in database.")

    # 3 & 4. Upload Project Thumbnail (WebP format)
    print("\n[Step 3 & 4] Uploading project thumbnail to media/projects/...")
    upload_res = client.post(
        f"{BASE_API}/admin/media/upload",
        files={"file": ("rubis-cover.webp", io.BytesIO(TINY_WEBP), "image/webp")},
        data={"category": "projects"},
        headers=headers,
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    upload_data = upload_res.json()
    media_url = upload_data["url"]
    filename = upload_data["filename"]
    print(f"✓ Upload successful! Stored path: {media_url} (filename: {filename})")

    # 5. Verify image is stored in media/projects/ on disk
    print("\n[Step 5] Verifying physical file existence in backend/media/projects/...")
    disk_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media", "projects", filename)
    assert os.path.exists(disk_path), f"File not found on disk at {disk_path}"
    assert os.path.getsize(disk_path) == len(TINY_WEBP)
    print(f"✓ Physical file confirmed on disk at {disk_path} ({os.path.getsize(disk_path)} bytes).")

    # 6. Save project with thumbnail_url and image_url
    print("\n[Step 6] Saving project to database with uploaded media path...")
    test_slug = "e2e-aurora-commerce"
    # Clean up existing test project if needed
    for p in initial_projects:
        if p["slug"] == test_slug:
            client.delete(f"{BASE_API}/admin/projects/{p['id']}", headers=headers)

    project_payload = {
        "title": "AURORA Commerce Platform",
        "slug": test_slug,
        "category": "Enterprise Headless Flagship",
        "description": "High-velocity luxury commerce engine with instant edge revalidation.",
        "thumbnail_url": media_url,
        "image_url": media_url,
        "featured": True,
        "published": True,
        "order": 1,
        "technologies": [{"name": "Next.js", "slug": "nextjs"}, {"name": "FastAPI", "slug": "fastapi"}],
    }
    create_res = client.post(f"{BASE_API}/admin/projects", json=project_payload, headers=headers)
    assert create_res.status_code == 201, f"Failed creating project: {create_res.text}"
    created_project = create_res.json()
    created_id = created_project["id"]
    print(f"✓ Project created: ID={created_id}, Slug={created_project['slug']}, Thumbnail={created_project['thumbnail_url']}")

    # 7 & 8. Mark Published = True, Featured = True
    print("\n[Step 7 & 8] Verifying published=True and featured=True flags...")
    assert created_project["published"] is True
    assert created_project["featured"] is True
    print("✓ Published & Featured flags verified active.")

    # 9. Open homepage & check API
    print("\n[Step 9] Checking homepage API and public endpoints...")
    public_projects_res = client.get(f"{BASE_API}/public/projects")
    assert public_projects_res.status_code == 200
    public_projects = public_projects_res.json()
    created_in_public = [p for p in public_projects if p["slug"] == test_slug]
    assert len(created_in_public) == 1, "Project not found in public list"
    print(f"✓ Project appears in public API data.")

    # 10. Verify project appears in Selected Work
    print("\n[Step 10] Checking Next.js homepage rendering...")
    web_res = client.get(f"{BASE_WEB}/")
    assert web_res.status_code == 200
    assert "AURORA Commerce Platform" in web_res.text
    print("✓ Project title successfully rendered on Next.js Homepage Selected Work.")

    # 11. Verify uploaded image URL appears on Homepage
    print("\n[Step 11] Verifying uploaded media URL appears in HTML and resolves...")
    assert media_url in web_res.text
    # Check media fetching through Next.js proxy rewrite
    media_web_res = client.get(f"{BASE_WEB}{media_url}")
    assert media_web_res.status_code == 200
    assert media_web_res.content == TINY_WEBP
    print(f"✓ Image served successfully through Next.js /media rewrite ({len(media_web_res.content)} bytes).")

    # 12 & 13. Click project & Verify /projects/[slug]
    print(f"\n[Step 12 & 13] Verifying /projects/{test_slug} detail page...")
    detail_web_res = client.get(f"{BASE_WEB}/projects/{test_slug}")
    assert detail_web_res.status_code == 200
    assert "AURORA Commerce Platform" in detail_web_res.text
    print(f"✓ Project detail page /projects/{test_slug} loaded with status 200.")

    # 14. Verify project detail image loads
    print("\n[Step 14] Verifying detail page renders the uploaded image...")
    assert media_url in detail_web_res.text
    print("✓ Uploaded image correctly embedded in project detail page HTML.")

    # 15 & 16. Replace image from Admin
    print("\n[Step 15 & 16] Replacing image with new PNG asset from Admin...")
    replace_upload_res = client.post(
        f"{BASE_API}/admin/media/upload",
        files={"file": ("aurora-updated.png", io.BytesIO(TINY_PNG), "image/png")},
        data={"category": "projects"},
        headers=headers,
    )
    assert replace_upload_res.status_code == 200
    new_media_url = replace_upload_res.json()["url"]
    new_filename = replace_upload_res.json()["filename"]
    print(f"✓ Replacement uploaded to: {new_media_url}")

    # Update project with new media URL
    update_res = client.put(
        f"{BASE_API}/admin/projects/{created_id}",
        json={"thumbnail_url": new_media_url, "image_url": new_media_url},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["thumbnail_url"] == new_media_url
    print(f"✓ Project record updated to new media URL: {new_media_url}")

    # Verify replacement file resolves
    check_new_media = client.get(f"{BASE_WEB}{new_media_url}")
    assert check_new_media.status_code == 200
    assert check_new_media.content == TINY_PNG
    print("✓ New replacement image successfully retrieved through /media rewrite.")

    # 17. Test invalid file upload (executable / unsupported format)
    print("\n[Step 17] Testing invalid file upload rejection...")
    bad_file = {"file": ("malicious.sh", io.BytesIO(b"#!/bin/bash\nrm -rf /"), "text/x-shellscript")}
    bad_res = client.post(f"{BASE_API}/admin/media/upload", files=bad_file, headers=headers)
    assert bad_res.status_code == 400
    print(f"✓ Invalid file rejected with status 400: {bad_res.json()['detail']}")

    # 18. Test oversized file upload (> 10MB)
    print("\n[Step 18] Testing oversized file rejection (> 10MB)...")
    oversized_data = TINY_PNG + (b"\x00" * (10 * 1024 * 1024 + 512))
    over_file = {"file": ("huge.png", io.BytesIO(oversized_data), "image/png")}
    over_res = client.post(f"{BASE_API}/admin/media/upload", files=over_file, headers=headers)
    assert over_res.status_code == 400
    print(f"✓ Oversized file rejected with status 400: {over_res.json()['detail']}")

    # 19. Test unauthenticated upload
    print("\n[Step 19] Testing unauthenticated upload rejection (no token)...")
    unauth_file = {"file": ("anonymous.png", io.BytesIO(TINY_PNG), "image/png")}
    unauth_res = client.post(f"{BASE_API}/admin/media/upload", files=unauth_file)
    assert unauth_res.status_code == 401
    print(f"✓ Unauthenticated upload rejected with status 401: {unauth_res.json()['detail']}")

    # Clean up test project & media
    print("\n[Cleanup] Cleaning up E2E test project and test media...")
    client.delete(f"{BASE_API}/admin/projects/{created_id}", headers=headers)
    client.delete(f"{BASE_API}/admin/media?url={media_url}", headers=headers)
    client.delete(f"{BASE_API}/admin/media?url={new_media_url}", headers=headers)
    print("✓ Cleanup completed.")

    print("\n=========================================")
    print("  ALL 19 VERIFICATION STEPS PASSED 100%  ")
    print("=========================================")


if __name__ == "__main__":
    run_all_checks()
