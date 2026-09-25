/**
 * API Data Interfaces for Next Aura Innovation CMS
 * Synchronized with FastAPI Backend Schemas
 */

export interface SiteSettings {
  brand_name: string;
  email: string;
  domain: string;
  logo?: string;
  tagline?: string;
}

export interface HomeContent {
  hero_tag?: string;
  hero_headline: string;
  hero_description: string;
  hero_cta_text: string;
  hero_cta_url?: string;
  about_tag?: string;
  about_headline: string;
  about_description: string;
  about_callout: string;
  cta_tag?: string;
  cta_headline: string;
  cta_description: string;
  cta_button_text: string;
}

export interface Technology {
  id?: number | string;
  name: string;
  slug: string;
}

export interface Project {
  id: number | string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image_url?: string;
  thumbnail_url?: string;
  live_url?: string;
  github_url?: string;
  featured: boolean;
  published: boolean;
  order: number;
  technologies?: Technology[];
}
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedProjects {
  items: Project[];
  pagination: PaginationMeta;
}
export interface MediaItem {
  filename: string;
  category: "projects" | "services" | "packages" | "site" | string;
  url: string;
  size: number;
  created_at: number;
  in_use: boolean;
  references: string[];
}

export interface ServiceItem {
  id: number | string;
  order: number;
  slug?: string;
  number?: string;
  title: string;
  description: string;
  active: boolean;
  features?: string[];
}

export interface ApproachStep {
  step: string;
  title: string;
  description: string;
}

export interface Package {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  formatted_price: string;
  currency: string;
  short_description: string;
  description: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  suitable_for?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  company?: string;
  service_interest?: string;
  budget?: string;
  message: string;
}

export interface ContactSubmissionResponse extends ContactSubmissionPayload {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  inquiries_count: number;
  new_inquiries_count: number;
  projects_count: number;
  published_projects_count?: number;
  services_count: number;
  packages_count: number;
}
