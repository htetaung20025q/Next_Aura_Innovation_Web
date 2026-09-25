"""Integration tests for Next Aura INNOVATION API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["brand_name"] == "Next Aura INNOVATION"
    assert data["email"] == "nextaura.innovation@gmail.com"


def test_home_aggregate():
    response = client.get("/api/home")
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "projects" in data
    assert "services" in data
    assert len(data["projects"]) >= 2
    assert len(data["services"]) >= 4


def test_projects_listing_and_detail():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 2
    slugs = [p["slug"] for p in projects]
    assert "rubis" in slugs
    assert len(slugs) >= 2

    # Detail
    detail_res = client.get("/api/projects/rubis")
    assert detail_res.status_code == 200
    rubis = detail_res.json()
    assert rubis["slug"] == "rubis"


def test_projects_pagination():
    # Page 1 with page_size=2
    res = client.get("/api/public/projects?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "pagination" in data
    pag = data["pagination"]
    assert pag["page"] == 1
    assert pag["page_size"] == 2
    assert pag["total"] >= 2
    assert pag["total_pages"] >= 1
    assert pag["has_previous"] is False
    assert len(data["items"]) <= 2

    # Validation: page_size > 20 rejected
    res_oversize = client.get("/api/public/projects?page=1&page_size=50")
    assert res_oversize.status_code == 422

    # Validation: page < 1 rejected
    res_bad_page = client.get("/api/public/projects?page=0&page_size=2")
    assert res_bad_page.status_code == 422


def test_services_listing_and_detail():
    response = client.get("/api/services")
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 4
    
    detail_res = client.get("/api/services/web-experiences")
    assert detail_res.status_code == 200
    svc = detail_res.json()
    assert svc["title"] == "WEB EXPERIENCES"


def test_packages_listing_and_detail():
    response = client.get("/api/packages")
    assert response.status_code == 200
    packages = response.json()
    assert len(packages) >= 3

    detail_res = client.get("/api/packages/business")
    assert detail_res.status_code == 200
    pkg = detail_res.json()
    assert pkg["is_popular"] is True
    assert pkg["price"] == 2000000.0


def test_contact_submission():
    payload = {
        "name": "Aung Ko",
        "email": "aungko@example.com",
        "company": "Apex Dynamics Ltd",
        "service_interest": "Business Systems",
        "budget": "2,000,000 MMK",
        "message": "We need a custom inventory database and ERP platform for our branches.",
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Aung Ko"
    assert data["status"] == "new"
    assert "id" in data


def test_admin_auth_and_protected_stats():
    # Login with seeded credentials
    login_res = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "NextAura2026!Secure"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token

    # Access protected stats
    headers = {"Authorization": f"Bearer {token}"}
    stats_res = client.get("/api/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["projects_count"] >= 2
    assert stats["services_count"] >= 4
    assert stats["packages_count"] >= 3
    assert stats["inquiries_count"] >= 1


def test_unauthorized_access():
    res = client.get("/api/admin/stats")
    assert res.status_code == 401


def test_public_aliases():
    res_proj = client.get("/api/public/projects")
    assert res_proj.status_code == 200
    assert len(res_proj.json()) >= 2

    res_proj_detail = client.get("/api/public/projects/rubis")
    assert res_proj_detail.status_code == 200
    assert res_proj_detail.json()["slug"] == "rubis"

    res_svc = client.get("/api/public/services")
    assert res_svc.status_code == 200
    assert len(res_svc.json()) >= 4


def test_admin_project_crud_lifecycle():
    # 1. Login
    login_res = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "NextAura2026!Secure"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Project
    new_proj = {
        "title": "Aura Intelligence Telemetry",
        "slug": "aura-intelligence-telemetry",
        "category": "Enterprise Telemetry Platform",
        "description": "High-throughput operational monitoring and analytics engine for logistics fleets.",
        "order": 5,
        "featured": True,
        "published": True,
        "technologies": [{"name": "Next.js", "slug": "nextjs"}, {"name": "FastAPI", "slug": "fastapi"}],
    }
    create_res = client.post("/api/admin/projects", json=new_proj, headers=headers)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]
    assert created_id is not None
    assert create_res.json()["slug"] == "aura-intelligence-telemetry"

    # 3. Retrieve via Admin list
    list_res = client.get("/api/admin/projects", headers=headers)
    assert list_res.status_code == 200
    project_ids = [p["id"] for p in list_res.json()]
    assert created_id in project_ids

    # 4. Update Project (e.g. toggle published = False)
    update_res = client.put(
        f"/api/admin/projects/{created_id}",
        json={"published": False, "title": "Aura Intelligence Telemetry (Draft)"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["published"] is False
    assert update_res.json()["title"] == "Aura Intelligence Telemetry (Draft)"

    # 5. Delete Project
    del_res = client.delete(f"/api/admin/projects/{created_id}", headers=headers)
    assert del_res.status_code == 200

    # 6. Verify deletion
    verify_res = client.get(f"/api/admin/projects/{created_id}", headers=headers)
    assert verify_res.status_code == 404
