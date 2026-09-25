"""Idempotent database seeding script for Next Aura INNOVATION."""

import logging
from sqlalchemy import select
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.contact import ContactSubmission
from app.models.content import HomeContent, SiteSettings
from app.models.package import Package
from app.models.project import Project
from app.models.service import Service
from app.models.user import AdminUser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_database():
    """Populate database with official seed data."""
    db = SessionLocal()
    try:
        # 1. Site Settings
        existing_settings = db.scalar(select(SiteSettings).limit(1))
        if not existing_settings:
            logger.info("Seeding SiteSettings...")
            settings = SiteSettings(
                brand_name="Next Aura INNOVATION",
                email="nextaura.innovation@gmail.com",
                domain="nextaura.innovation.com",
                tagline="Engineering Digital Systems for Real Business.",
            )
            db.add(settings)
        else:
            existing_settings.brand_name = "Next Aura INNOVATION"
            existing_settings.email = "nextaura.innovation@gmail.com"
            existing_settings.domain = "nextaura.innovation.com"

        # 2. Home Content
        existing_home = db.scalar(select(HomeContent).limit(1))
        if not existing_home:
            logger.info("Seeding HomeContent...")
            home = HomeContent(
                hero_headline="WE BUILD\nDIGITAL SYSTEMS\nFOR REAL\nBUSINESS.",
                hero_description="Websites · E-Commerce · ERP · Business Systems · Custom Software",
                hero_cta_text="START A PROJECT",
                hero_cta_url="/contact",
                about_headline="ABOUT NEXT AURA",
                about_description="Next Aura Innovation is an engineering-driven digital product studio. We build high-performance web systems, custom business platforms, and scalable software for organizations that prioritize reliability, clarity, and architectural integrity.",
                about_callout="“Not just a website. A digital system built around how your business works.”",
                cta_headline="START A PROJECT",
                cta_description="Tell us about your project, timeline, and goals. Let’s build something real together.",
                cta_button_text="START A PROJECT",
            )
            db.add(home)

        # 3. Projects
        projects_data = [
            {
                "title": "RUBIS — Luxury Ruby Marketplace",
                "slug": "rubis",
                "category": "Luxury E-Commerce & Marketplace",
                "description": "An ultra-premium, high-security gemstone trading marketplace engineered with bespoke inventory tracking, certified ruby verification, and real-time transaction processing.",
                "live_url": "https://rubis.nextaurainnovation.com",
                "github_url": "https://github.com/NextAuraInnovation/rubis-marketplace",
                "featured": True,
                "published": True,
                "order": 1,
                "technologies": [
                    {"name": "Next.js", "slug": "nextjs"},
                    {"name": "TypeScript", "slug": "typescript"},
                    {"name": "FastAPI", "slug": "fastapi"},
                    {"name": "PostgreSQL", "slug": "postgresql"},
                ],
            },
            {
                "title": "KHU NYI KAL SAL — Emergency Support Platform",
                "slug": "khu-nyi-kal-sal",
                "category": "Public Infrastructure & Aid Platform",
                "description": "A high-availability crisis assistance routing network that coordinates emergency dispatch, volunteer deployment, and verified relief supplies across Myanmar.",
                "live_url": "https://khunyikalsal.org",
                "github_url": "https://github.com/NextAuraInnovation/khu-nyi-kal-sal",
                "featured": True,
                "published": True,
                "order": 2,
                "technologies": [
                    {"name": "Next.js", "slug": "nextjs"},
                    {"name": "FastAPI", "slug": "fastapi"},
                    {"name": "PostgreSQL", "slug": "postgresql"},
                    {"name": "Redis", "slug": "redis"},
                ],
            },
        ]

        for p_data in projects_data:
            existing = db.scalar(select(Project).where(Project.slug == p_data["slug"]))
            if not existing:
                logger.info("Seeding project: %s", p_data["slug"])
                project = Project(**p_data)
                db.add(project)

        # 4. Services
        services_data = [
            {
                "title": "WEB EXPERIENCES",
                "slug": "web-experiences",
                "description": "Fast, editorial, and responsive websites designed to give businesses a strong digital presence.",
                "full_description": "We engineer lightning-fast digital flagship experiences with modern server-side rendering, sub-second load times, and responsive layouts that convert visitors into clients.",
                "features": [
                    "Custom Next.js App Router Architecture",
                    "Fluid Editorial Typography & Layouts",
                    "SEO Engine & Structured JSON-LD Data",
                    "Sub-second Page Load Benchmarks",
                ],
                "order": 1,
                "active": True,
            },
            {
                "title": "BUSINESS SYSTEMS",
                "slug": "business-systems",
                "description": "Internal tools, dashboards, and workflows that streamline operations and eliminate manual work.",
                "full_description": "Automate core company workflows with bespoke administrative consoles, role-based access control, and seamless database orchestration.",
                "features": [
                    "Role-Based Access Control (RBAC)",
                    "High-Throughput Relational Data Modeling",
                    "Automated Operational Workflow Triggers",
                    "Real-Time Telemetry Dashboards",
                ],
                "order": 2,
                "active": True,
            },
            {
                "title": "E-COMMERCE & ERP",
                "slug": "ecommerce-erp",
                "description": "Integrated platforms that combine product sales, inventory management, and order tracking in one place.",
                "full_description": "End-to-end commerce platforms connected to unified inventory management, multi-warehouse tracking, and transactional accounting pipelines.",
                "features": [
                    "Unified Inventory & Order Pipelines",
                    "Secure Payment Gateway Integrations",
                    "Multi-Currency Financial Reconciliation",
                    "Automated Invoice & Delivery Tracking",
                ],
                "order": 3,
                "active": True,
            },
            {
                "title": "CUSTOM SOFTWARE",
                "slug": "custom-software",
                "description": "Tailored software solutions designed around your unique business logic and requirements.",
                "full_description": "Bespoke software built to solve specific organizational bottlenecks, from API integrations and background job pipelines to data migrations.",
                "features": [
                    "FastAPI Layered Monolith Architecture",
                    "Pydantic Schema Validation & Contract Enforcement",
                    "Asynchronous Task Workers & Queue Engines",
                    "Enterprise PostgreSQL ACID Compliance",
                ],
                "order": 4,
                "active": True,
            },
        ]

        for s_data in services_data:
            existing = db.scalar(select(Service).where(Service.slug == s_data["slug"]))
            if not existing:
                logger.info("Seeding service: %s", s_data["slug"])
                service = Service(**s_data)
                db.add(service)

        # 5. Packages
        packages_data = [
            {
                "name": "Starter Tier",
                "slug": "starter",
                "price": 300000,
                "formatted_price": "300,000 MMK",
                "currency": "MMK",
                "short_description": "Essential digital presence engineered for emerging businesses requiring speed, precision, and modern aesthetics.",
                "description": "A focused, production-ready web application built with Next.js and Tailwind CSS. Designed for rapid deployment with optimal responsive performance and clean editorial typography.",
                "features": [
                    "Single-page responsive digital showcase",
                    "Mobile-optimized fluid layouts",
                    "Domain connection & SSL setup",
                    "Core SEO optimization & meta tags",
                    "Contact inquiry routing to email",
                    "Production-ready deployment",
                ],
                "suitable_for": "Early-stage businesses, personal portfolios, and focused product landing pages.",
                "is_popular": False,
                "is_active": True,
                "sort_order": 1,
            },
            {
                "name": "Business Tier",
                "slug": "business",
                "price": 2000000,
                "formatted_price": "2,000,000 MMK",
                "currency": "MMK",
                "short_description": "Comprehensive multi-page digital platform with custom backend architecture and content management.",
                "description": "Complete digital system connecting a Next.js frontend with a custom FastAPI backend. Engineered for growing businesses needing dynamic content, interactive workflows, and high performance.",
                "features": [
                    "Multi-page responsive web system",
                    "Custom FastAPI backend & REST API",
                    "PostgreSQL relational database schema",
                    "Administrative CMS dashboard for content updates",
                    "Interactive contact & lead management pipeline",
                    "Advanced SEO architecture & OpenGraph cards",
                    "Performance optimization & sub-second load times",
                    "Automated backup configuration",
                ],
                "suitable_for": "Growing enterprises, established brands, and agencies requiring CMS control and dedicated API architecture.",
                "is_popular": True,
                "is_active": True,
                "sort_order": 2,
            },
            {
                "name": "Enterprise Tier",
                "slug": "enterprise",
                "price": 3000000,
                "formatted_price": "3,000,000 MMK",
                "currency": "MMK",
                "short_description": "Full-scale bespoke software architecture, custom business logic, and enterprise-grade infrastructure.",
                "description": "Advanced full-stack solution engineered for organizations with complex requirements: custom database models, role-based permissions, automated workflows, and dedicated deployment architecture.",
                "features": [
                    "Full-stack custom software system",
                    "High-performance Next.js + FastAPI + PostgreSQL",
                    "Custom database models & Alembic migrations",
                    "Role-based access control (RBAC) & authentication",
                    "E-commerce or ERP workflow automation modules",
                    "Third-party API integrations & webhooks",
                    "Dedicated performance monitoring & telemetry",
                    "Complete source code ownership & documentation",
                    "Priority engineering support & maintenance",
                ],
                "suitable_for": "High-volume commerce platforms, ERP systems, internal tools, and multi-user business platforms.",
                "is_popular": False,
                "is_active": True,
                "sort_order": 3,
            },
        ]

        for pkg_data in packages_data:
            existing = db.scalar(select(Package).where(Package.slug == pkg_data["slug"]))
            if not existing:
                logger.info("Seeding package: %s", pkg_data["slug"])
                package = Package(**pkg_data)
                db.add(package)

        # 6. Admin User
        admin_user = db.scalar(select(AdminUser).where(AdminUser.username == "admin"))
        if not admin_user:
            logger.info("Seeding admin user: admin")
            admin = AdminUser(
                username="admin",
                email="admin@nextaurainnovation.com",
                hashed_password=get_password_hash("NextAura2026!Secure"),
                is_active=True,
                is_superuser=True,
            )
            db.add(admin)

        db.commit()
        logger.info("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        logger.error("Error seeding database: %s", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
