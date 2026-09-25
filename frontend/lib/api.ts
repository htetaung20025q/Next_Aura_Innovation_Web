/**
 * Next Aura Innovation - FastAPI API Client & CMS Fallbacks
 */

import {
  HomeContent,
  MediaItem,
  Package,
  PaginatedProjects,
  PaginationMeta,
  Project,
  ServiceItem,
  SiteSettings,
} from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:8000");

export function getMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (process.env.NEXT_PUBLIC_MEDIA_URL) {
    const cleanMediaBase = process.env.NEXT_PUBLIC_MEDIA_URL.replace(/\/+$/, "");
    return `${cleanMediaBase}${cleanPath}`;
  }
  if (typeof window === "undefined") {
    return `${BACKEND_BASE_URL}${cleanPath}`;
  }
  return cleanPath;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText} at ${url}`);
  }

  return res.json();
}

/**
 * Fallback values matching the Figma source of truth
 */
export const defaultSiteSettings: SiteSettings = {
  brand_name: "Next Aura INNOVATION",
  email: "nextaura.innovation@gmail.com",
  domain: "nextaura.innovation.com",
  tagline: "Digital Product & Software Studio",
};

export const defaultHomeContent: HomeContent = {
  hero_headline: "WE BUILD\nDIGITAL SYSTEMS\nFOR REAL\nBUSINESS.",
  hero_description:
    "Websites · E-Commerce · ERP · Business Systems · Custom Software",
  hero_cta_text: "START A PROJECT",
  hero_cta_url: "/contact",
  about_headline: "ABOUT NEXT AURA",
  about_description:
    "Next Aura Innovation is an engineering-driven digital product studio. We build high-performance web systems, custom business platforms, and scalable software for organizations that prioritize reliability, clarity, and architectural integrity.",
  about_callout:
    "“Not just a website. A digital system built around how your business works.”",
  cta_headline: "START A PROJECT",
  cta_description:
    "Tell us about your project, timeline, and goals. Let’s build something real together.",
  cta_button_text: "START A PROJECT",
};

export const defaultProjects: Project[] = [
  {
    id: 1,
    title: "RUBIS",
    slug: "rubis",
    category: "Luxury Ruby Marketplace",
    description:
      "A high-conversion luxury ruby marketplace and digital commerce platform with real-time inventory and catalog management.",
    live_url: "#",
    featured: true,
    published: true,
    order: 1,
    technologies: [
      { name: "Next.js", slug: "nextjs" },
      { name: "FastAPI", slug: "fastapi" },
      { name: "PostgreSQL", slug: "postgresql" },
    ],
  },
  {
    id: 2,
    title: "KHU NYI KAL SAL",
    slug: "khu-nyi-kal-sal",
    category: "Emergency Support Platform",
    description:
      "A resilient real-time emergency coordination platform engineered for rapid dispatch and critical response management.",
    live_url: "#",
    featured: true,
    published: true,
    order: 2,
    technologies: [
      { name: "React", slug: "react" },
      { name: "Python", slug: "python" },
      { name: "WebSockets", slug: "websockets" },
    ],
  },
];

export const defaultServices: ServiceItem[] = [
  {
    id: 1,
    order: 1,
    slug: "web-experiences",
    title: "WEB EXPERIENCES",
    description:
      "High-performance editorial websites and flagship digital experiences designed with surgical attention to typography and performance.",
    active: true,
    features: [
      "Bespoke Editorial Web Design",
      "Next.js App Router Architecture",
      "Sub-second Load Times",
      "Dynamic Content Rendering",
      "Fluid Multi-Device Responsiveness",
    ],
  },
  {
    id: 2,
    order: 2,
    slug: "business-systems",
    title: "BUSINESS SYSTEMS",
    description:
      "Internal tools, administrative dashboards, automated workflows, and operational software that eliminate friction.",
    active: true,
    features: [
      "Custom Workflow Automation",
      "Operational Dashboards",
      "Role-Based Access Control",
      "Data Synchronization Pipelines",
      "Legacy System Migration",
    ],
  },
  {
    id: 3,
    order: 3,
    slug: "ecommerce-erp",
    title: "E-COMMERCE & ERP",
    description:
      "Robust digital commerce infrastructure, order processing pipelines, and integrated inventory engines for ambitious businesses.",
    active: true,
    features: [
      "Custom Checkout & Inventory",
      "Payment Gateway Integration",
      "Real-Time Stock Tracking",
      "ERP Data Normalization",
      "Multi-Currency Handling",
    ],
  },
  {
    id: 4,
    order: 4,
    slug: "custom-software",
    title: "CUSTOM SOFTWARE",
    description:
      "Tailored web applications, API integrations, and database architectures engineered for scalability and reliability.",
    active: true,
    features: [
      "FastAPI & PostgreSQL Stacks",
      "Complex Business Logic Modeling",
      "High Concurrency Systems",
      "Alembic Database Versioning",
      "Long-term Technical Architecture",
    ],
  },
];

export const defaultPackages: Package[] = [
  {
    id: 1,
    name: "Starter System",
    slug: "starter",
    price: 300000,
    formatted_price: "300,000 MMK",
    currency: "MMK",
    is_popular: false,
    short_description:
      "Essential digital presence and foundational web system for modern business.",
    description:
      "A high-performance editorial web system designed to establish an authoritative digital flagship with surgical precision in typography, layout, responsiveness, and performance.",
    features: [
      "High-Performance Editorial Web System",
      "Fully Responsive Architecture (Mobile, Tablet, Desktop)",
      "Core System Architecture & Fluid Navigation",
      "SEO Foundation & OpenGraph Optimization",
      "High-Speed Asset Delivery & CDN Caching",
      "Custom Domain Setup & Cloud Deployment",
      "Direct Inquiry & Contact Routing",
    ],
    suitable_for: "Businesses establishing a solid, high-converting digital presence.",
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name: "Business System",
    slug: "business",
    price: 2000000,
    formatted_price: "2,000,000 MMK",
    currency: "MMK",
    is_popular: true,
    short_description:
      "Dynamic CMS-driven platform with custom FastAPI backend and PostgreSQL database.",
    description:
      "A complete end-to-end digital software platform engineered for growing companies requiring custom APIs, relational data models, and an admin CMS to manage operations and content dynamically.",
    features: [
      "Everything in Starter System",
      "Custom Python FastAPI Backend Architecture",
      "PostgreSQL Relational Database Integration",
      "Admin CMS Dashboard for Content Management",
      "Automated Database Migrations (Alembic)",
      "Layered Repository & Service Architecture",
      "Dynamic Workflows & Real-Time State",
      "Priority Engineering & Technical Support",
    ],
    suitable_for: "Growing companies requiring dynamic operations, CMS control, and robust backends.",
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name: "Enterprise System",
    slug: "enterprise",
    price: 3000000,
    formatted_price: "3,000,000 MMK",
    currency: "MMK",
    is_popular: false,
    short_description:
      "Full-scale custom software suite, advanced ERP/e-commerce engine, and dedicated infrastructure.",
    description:
      "Comprehensive enterprise-grade software architecture tailored for mission-critical business platforms, complex data schemas, inventory systems, multi-role access control, and high-concurrency performance.",
    features: [
      "Everything in Business System",
      "Custom E-Commerce Engine & Order Pipelines",
      "Internal ERP & Inventory Management Systems",
      "Multi-Role JWT Authentication & RBAC Access",
      "Real-Time Telemetry & Performance Monitoring",
      "Custom API Integration & Webhook Gateways",
      "Automated Backups & Redundancy Strategy",
      "Dedicated Architecture Consultation & SLA",
    ],
    suitable_for: "Organizations requiring mission-critical business systems and bespoke software.",
    is_active: true,
    sort_order: 3,
  },
];

export const approachSteps = [
  {
    step: "01",
    title: "UNDERSTAND",
    description:
      "Deep analysis of business requirements, bottlenecks, and objectives before writing a line of code.",
  },
  {
    step: "02",
    title: "DESIGN",
    description:
      "Architecture, UX precision, and high-fidelity interaction systems tailored to your operation.",
  },
  {
    step: "03",
    title: "BUILD",
    description:
      "Clean code, scalable infrastructure, strict type-safety, and database integrity.",
  },
  {
    step: "04",
    title: "REFINE",
    description:
      "Continuous optimization, monitoring, analytics, and long-term technical reliability.",
  },
];

export const api = {
  getHomeContent: async (): Promise<HomeContent> => {
    try {
      return await fetchAPI<HomeContent>("/home");
    } catch {
      return defaultHomeContent;
    }
  },

  getSiteSettings: async (): Promise<SiteSettings> => {
    try {
      return await fetchAPI<SiteSettings>("/settings");
    } catch {
      return defaultSiteSettings;
    }
  },

  getProjects: async (): Promise<Project[]> => {
    try {
      return await fetchAPI<Project[]>("/projects");
    } catch {
      return defaultProjects;
    }
  },

  getProjectsPaginated: async (
    page: number = 1,
    pageSize: number = 2
  ): Promise<PaginatedProjects> => {
    try {
      return await fetchAPI<PaginatedProjects>(
        `/projects?page=${page}&page_size=${pageSize}`
      );
    } catch {
      const all = defaultProjects;
      const total = all.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const start = (page - 1) * pageSize;
      const items = all.slice(start, start + pageSize);
      return {
        items,
        pagination: {
          page,
          page_size: pageSize,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      };
    }
  },

  getProjectBySlug: async (slug: string): Promise<Project | null> => {
    try {
      return await fetchAPI<Project>(`/projects/${slug}`);
    } catch {
      return defaultProjects.find((p) => p.slug === slug) || null;
    }
  },

  getServices: async (): Promise<ServiceItem[]> => {
    try {
      return await fetchAPI<ServiceItem[]>("/services");
    } catch {
      return defaultServices;
    }
  },

  getServiceBySlug: async (slug: string): Promise<ServiceItem | null> => {
    try {
      return await fetchAPI<ServiceItem>(`/services/${slug}`);
    } catch {
      return defaultServices.find((s) => s.slug === slug) || null;
    }
  },

  getPackages: async (): Promise<Package[]> => {
    try {
      return await fetchAPI<Package[]>("/packages");
    } catch {
      return defaultPackages;
    }
  },

  getPackageBySlug: async (slug: string): Promise<Package | null> => {
    try {
      return await fetchAPI<Package>(`/packages/${slug}`);
    } catch {
      return defaultPackages.find((pkg) => pkg.slug === slug) || null;
    }
  },

  submitContact: async (
    payload: import("@/types/api").ContactSubmissionPayload
  ): Promise<import("@/types/api").ContactSubmissionResponse> => {
    return await fetchAPI<import("@/types/api").ContactSubmissionResponse>(
      "/contact",
      {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );
  },

  adminLogin: async (username: string, password: string): Promise<{ access_token: string }> => {
    return await fetchAPI<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
  },

  getAdminStats: async (token: string): Promise<import("@/types/api").DashboardStats> => {
    return await fetchAPI<import("@/types/api").DashboardStats>("/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  getAdminInquiries: async (
    token: string
  ): Promise<import("@/types/api").ContactSubmissionResponse[]> => {
    return await fetchAPI<import("@/types/api").ContactSubmissionResponse[]>(
      "/admin/inquiries",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
  },

  updateInquiryStatus: async (
    id: number,
    status: string,
    token: string
  ): Promise<import("@/types/api").ContactSubmissionResponse> => {
    return await fetchAPI<import("@/types/api").ContactSubmissionResponse>(
      `/admin/inquiries/${id}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
        cache: "no-store",
      }
    );
  },

  // --- Project CMS ---
  getAdminProjects: async (token: string): Promise<Project[]> => {
    return await fetchAPI<Project[]>("/admin/projects", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  createProject: async (data: Partial<Project>, token: string): Promise<Project> => {
    return await fetchAPI<Project>("/admin/projects", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  updateProject: async (id: number | string, data: Partial<Project>, token: string): Promise<Project> => {
    return await fetchAPI<Project>(`/admin/projects/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  deleteProject: async (id: number | string, token: string): Promise<Project> => {
    return await fetchAPI<Project>(`/admin/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // --- Service CMS ---
  getAdminServices: async (token: string): Promise<ServiceItem[]> => {
    return await fetchAPI<ServiceItem[]>("/admin/services", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  createService: async (data: Partial<ServiceItem>, token: string): Promise<ServiceItem> => {
    return await fetchAPI<ServiceItem>("/admin/services", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  updateService: async (id: number | string, data: Partial<ServiceItem>, token: string): Promise<ServiceItem> => {
    return await fetchAPI<ServiceItem>(`/admin/services/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  deleteService: async (id: number | string, token: string): Promise<ServiceItem> => {
    return await fetchAPI<ServiceItem>(`/admin/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  // --- Package CMS ---
  getAdminPackages: async (token: string): Promise<Package[]> => {
    return await fetchAPI<Package[]>("/admin/packages", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  updatePackage: async (id: number | string, data: Partial<Package>, token: string): Promise<Package> => {
    return await fetchAPI<Package>(`/admin/packages/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  // --- Settings & Home Content ---
  getAdminSettings: async (token: string): Promise<SiteSettings> => {
    return await fetchAPI<SiteSettings>("/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  updateAdminSettings: async (data: Partial<SiteSettings>, token: string): Promise<SiteSettings> => {
    return await fetchAPI<SiteSettings>("/admin/settings", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  getAdminHomeContent: async (token: string): Promise<HomeContent> => {
    return await fetchAPI<HomeContent>("/admin/home", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  updateAdminHomeContent: async (data: Partial<HomeContent>, token: string): Promise<HomeContent> => {
    return await fetchAPI<HomeContent>("/admin/home", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  },

  // --- Media & Asset Storage ---
  uploadMedia: async (
    file: File,
    category: "projects" | "services" | "packages" | "site" = "projects",
    token: string
  ): Promise<{ url: string; filename: string; category: string; size: number }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    const url = `${API_BASE_URL}/admin/media/upload`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  },

  uploadImage: async (file: File, token: string): Promise<{ url: string; filename: string }> => {
    return await api.uploadMedia(file, "projects", token);
  },

  getMediaList: async (token: string, category?: string): Promise<MediaItem[]> => {
    const query = category ? `?category=${category}` : "";
    return await fetchAPI<MediaItem[]>(`/admin/media${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },

  deleteMedia: async (
    url: string,
    token: string,
    force: boolean = false
  ): Promise<{ status: string; url: string; filename: string }> => {
    const endpoint = `/admin/media?url=${encodeURIComponent(url)}${force ? "&force=true" : ""}`;
    return await fetchAPI<{ status: string; url: string; filename: string }>(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  },
};
