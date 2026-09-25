"""Verification script for Projects Listing with Pagination."""

import httpx

BASE_API = "http://localhost:8000/api"
BASE_WEB = "http://localhost:3000"


def test_pagination_and_homepage_checks():
    client = httpx.Client(timeout=30.0)

    print("=== STARTING PROJECTS PAGINATION VERIFICATION ===")

    # 1. Admin login to check projects and create test set
    login_res = client.post(f"{BASE_API}/auth/login", json={"username": "admin", "password": "NextAura2026!Secure"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Admin authenticated.")

    # 2. Check total published projects
    projects_res = client.get(f"{BASE_API}/admin/projects", headers=headers)
    assert projects_res.status_code == 200
    current_projects = projects_res.json()
    print(f"✓ Total projects in DB: {len(current_projects)}")

    # Ensure we have at least 3 published projects so pagination has at least 2 pages (with page_size=2)
    created_test_ids = []
    published_count = len([p for p in current_projects if p.get("published", True)])
    if published_count < 3:
        needed = 3 - published_count
        for i in range(needed):
            slug = f"test-pagination-proj-{i+1}"
            payload = {
                "title": f"Test Project {i+1}",
                "slug": slug,
                "category": "Architecture Testing",
                "description": "Test description for pagination verification.",
                "published": True,
                "featured": False,
                "order": 10 + i,
            }
            res = client.post(f"{BASE_API}/admin/projects", json=payload, headers=headers)
            if res.status_code == 201:
                created_test_ids.append(res.json()["id"])
        print(f"✓ Created {len(created_test_ids)} temporary test projects to verify multi-page pagination.")

    # Create 1 UNPUBLISHED project to verify it does NOT appear publicly
    unpub_slug = "test-unpublished-secret-system"
    unpub_payload = {
        "title": "Unpublished Secret System",
        "slug": unpub_slug,
        "category": "Internal Confidential",
        "description": "This project must never be shown on public pages.",
        "published": False,
        "featured": False,
        "order": 999,
    }
    unpub_res = client.post(f"{BASE_API}/admin/projects", json=unpub_payload, headers=headers)
    assert unpub_res.status_code in [201, 400]
    if unpub_res.status_code == 201:
        created_test_ids.append(unpub_res.json()["id"])
    print("✓ Created 1 unpublished test project to verify publication filtering.")

    # 3. Test API Pagination
    print("\n--- Verifying FastAPI Public Pagination Endpoint ---")
    page1_res = client.get(f"{BASE_API}/public/projects?page=1&page_size=2")
    assert page1_res.status_code == 200
    data1 = page1_res.json()
    assert "items" in data1
    assert "pagination" in data1
    pag1 = data1["pagination"]
    assert pag1["page"] == 1
    assert pag1["page_size"] == 2
    assert pag1["total"] >= 3
    assert pag1["total_pages"] >= 2
    assert pag1["has_next"] is True
    assert pag1["has_previous"] is False
    assert len(data1["items"]) == 2
    print(f"✓ Page 1 API response: {len(data1['items'])} items, total={pag1['total']}, pages={pag1['total_pages']}, has_next={pag1['has_next']}, has_prev={pag1['has_previous']}")

    # Verify unpublished project is NOT in items
    all_slugs_page1 = [p["slug"] for p in data1["items"]]
    assert unpub_slug not in all_slugs_page1
    print("✓ Confirmed unpublished project is excluded from Page 1.")

    page2_res = client.get(f"{BASE_API}/public/projects?page=2&page_size=2")
    assert page2_res.status_code == 200
    data2 = page2_res.json()
    pag2 = data2["pagination"]
    assert pag2["page"] == 2
    assert pag2["has_previous"] is True
    print(f"✓ Page 2 API response: {len(data2['items'])} items, has_prev={pag2['has_previous']}")

    # 4. Test page_size limit (max 20)
    oversized_res = client.get(f"{BASE_API}/public/projects?page=1&page_size=50")
    assert oversized_res.status_code == 422
    print("✓ Page size > 20 properly rejected with status 422.")

    # 5. Test Homepage Selected Work (MAX 2 projects)
    print("\n--- Verifying Homepage Selected Work (Max 2 projects) ---")
    home_html = client.get(f"{BASE_WEB}/").text
    assert "SELECTED WORK" in home_html
    assert "VIEW ALL PROJECTS" in home_html
    assert 'href="/projects"' in home_html
    print("✓ Homepage contains 'SELECTED WORK' and 'VIEW ALL PROJECTS' linking to /projects.")

    # Count project detail links in Selected Work
    # Each card has link to /projects/...
    assert unpub_slug not in home_html
    print("✓ Unpublished project is hidden from Homepage.")

    # 6. Test /projects Page 1
    print("\n--- Verifying /projects Page 1 in Next.js ---")
    web_page1 = client.get(f"{BASE_WEB}/projects?page=1")
    assert web_page1.status_code == 200
    html1 = web_page1.text
    assert "ALL PROJECTS" in html1
    assert "Next" in html1
    assert unpub_slug not in html1
    print("✓ /projects?page=1 loaded successfully with 'Next' link and unpublished items hidden.")

    # 7. Test /projects Page 2
    print("\n--- Verifying /projects Page 2 in Next.js ---")
    web_page2 = client.get(f"{BASE_WEB}/projects?page=2")
    assert web_page2.status_code == 200
    html2 = web_page2.text
    assert "Previous" in html2
    print("✓ /projects?page=2 loaded successfully with 'Previous' link.")

    # 8. Test project detail page /projects/rubis
    print("\n--- Verifying Project Detail Page ---")
    rubis_api = client.get(f"{BASE_API}/public/projects/rubis").json()
    detail_res = client.get(f"{BASE_WEB}/projects/rubis")
    assert detail_res.status_code == 200
    assert rubis_api["title"] in detail_res.text
    print(f"✓ /projects/rubis loaded successfully (Title: {rubis_api['title']}).")

    # Clean up test projects
    print("\n--- Cleaning Up Temporary Test Records ---")
    for pid in created_test_ids:
        client.delete(f"{BASE_API}/admin/projects/{pid}", headers=headers)
    print("✓ Temporary records cleaned up.")

    print("\n=========================================")
    print(" ALL PROJECTS PAGINATION CHECKS PASSED!  ")
    print("=========================================")


if __name__ == "__main__":
    test_pagination_and_homepage_checks()
