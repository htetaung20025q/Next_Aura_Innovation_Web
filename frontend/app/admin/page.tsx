"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Edit,
  Eye,
  FileText,
  Globe,
  Inbox,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  UploadCloud,
  FolderArchive,
  Image as ImageIcon,
  Copy,
  X,
} from "lucide-react";
import { api, getMediaUrl } from "@/lib/api";
import {
  ContactSubmissionResponse,
  DashboardStats,
  HomeContent,
  MediaItem,
  Package,
  Project,
  ServiceItem,
  SiteSettings,
  Technology,
} from "@/types/api";

type TabType =
  | "dashboard"
  | "projects"
  | "services"
  | "packages"
  | "technologies"
  | "home"
  | "settings"
  | "inquiries"
  | "media";

export default function AdminPortalPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [inquiries, setInquiries] = useState<ContactSubmissionResponse[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Project Editor State
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    slug: "",
    category: "",
    description: "",
    image_url: "",
    live_url: "",
    github_url: "",
    order: 0,
    featured: true,
    published: true,
    technologiesInput: "Next.js, TypeScript, FastAPI, PostgreSQL",
  });
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);

  // Service Editor State
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    slug: "",
    description: "",
    full_description: "",
    order: 0,
    active: true,
    featuresInput: "",
  });
  const [deleteConfirmService, setDeleteConfirmService] = useState<ServiceItem | null>(null);

  // Package Editor State
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    price: 0,
    formatted_price: "",
    currency: "MMK",
    short_description: "",
    description: "",
    is_popular: false,
    is_active: true,
    sort_order: 0,
    suitable_for: "",
  });

  const loadAllData = async (authToken: string) => {
    setLoading(true);
    try {
      const [statsData, projectsData, servicesData, packagesData, inquiriesData, homeData, settingsData, mediaData] =
        await Promise.all([
          api.getAdminStats(authToken).catch(() => null),
          api.getAdminProjects(authToken).catch(() => []),
          api.getAdminServices(authToken).catch(() => []),
          api.getAdminPackages(authToken).catch(() => []),
          api.getAdminInquiries(authToken).catch(() => []),
          api.getAdminHomeContent(authToken).catch(() => null),
          api.getAdminSettings(authToken).catch(() => null),
          api.getMediaList(authToken).catch(() => []),
        ]);

      setStats(statsData);
      setProjects(projectsData);
      setServices(servicesData);
      setPackages(packagesData);
      setInquiries(inquiriesData);
      setHomeContent(homeData);
      setSiteSettings(settingsData);
      setMediaFiles(mediaData);
    } catch {
      setMessage({ type: "error", text: "Could not load admin data. Please verify database connectivity." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("next_aura_admin_token");
    if (!savedToken) {
      router.push("/admin/login");
      return;
    }
    setToken(savedToken);
    loadAllData(savedToken);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("next_aura_admin_token");
    router.push("/admin/login");
  };

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // --- Project Handlers ---
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      slug: "",
      category: "",
      description: "",
      image_url: "",
      live_url: "",
      github_url: "",
      order: projects.length + 1,
      featured: true,
      published: true,
      technologiesInput: "Next.js, TypeScript, FastAPI, PostgreSQL",
    });
    setIsProjectFormOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      slug: proj.slug,
      category: proj.category,
      description: proj.description,
      image_url: proj.image_url || "",
      live_url: proj.live_url || "",
      github_url: proj.github_url || "",
      order: proj.order ?? 0,
      featured: proj.featured ?? true,
      published: proj.published ?? true,
      technologiesInput: proj.technologies ? proj.technologies.map((t) => t.name).join(", ") : "",
    });
    setIsProjectFormOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);

    const techArray: Technology[] = projectForm.technologiesInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));

    const payload: Partial<Project> = {
      title: projectForm.title,
      slug:
        projectForm.slug.trim() ||
        projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      category: projectForm.category,
      description: projectForm.description,
      image_url: projectForm.image_url || undefined,
      live_url: projectForm.live_url || undefined,
      github_url: projectForm.github_url || undefined,
      order: Number(projectForm.order),
      featured: Boolean(projectForm.featured),
      published: Boolean(projectForm.published),
      technologies: techArray,
    };

    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject.id, payload, token);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showNotification(`Project "${updated.title}" updated successfully.`);
      } else {
        const created = await api.createProject(payload, token);
        setProjects((prev) => [...prev, created]);
        showNotification(`Project "${created.title}" published to database.`);
      }
      setIsProjectFormOpen(false);
      // Refresh stats
      api.getAdminStats(token).then((res) => setStats(res)).catch(() => null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save project.";
      showNotification(errMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!token || !deleteConfirmProject) return;
    setActionLoading(true);
    try {
      await api.deleteProject(deleteConfirmProject.id, token);
      setProjects((prev) => prev.filter((p) => p.id !== deleteConfirmProject.id));
      showNotification(`Project "${deleteConfirmProject.title}" removed.`);
      setDeleteConfirmProject(null);
      api.getAdminStats(token).then((res) => setStats(res)).catch(() => null);
    } catch {
      showNotification("Failed to delete project.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublished = async (proj: Project) => {
    if (!token) return;
    try {
      const updated = await api.updateProject(proj.id, { published: !proj.published }, token);
      setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
      showNotification(
        `Project "${proj.title}" is now ${updated.published ? "Published (Visible on site)" : "Draft (Hidden)"}.`
      );
      api.getAdminStats(token).then((res) => setStats(res)).catch(() => null);
    } catch {
      showNotification("Failed to update status", "error");
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    if (!token) return;
    try {
      const updated = await api.updateProject(proj.id, { featured: !proj.featured }, token);
      setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
      showNotification(
        `Project "${proj.title}" ${updated.featured ? "marked as Featured in Selected Work" : "unmarked as Featured"}.`
      );
    } catch {
      showNotification("Failed to update featured flag", "error");
    }
  };

  const handleProjectImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "projects" | "services" | "packages" | "site" = "projects"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setActionLoading(true);
    try {
      const res = await api.uploadMedia(file, category, token);
      setProjectForm((prev) => ({ ...prev, image_url: res.url }));
      // Refresh media catalog in background
      api.getMediaList(token).then((data) => setMediaFiles(data)).catch(() => {});
      showNotification(`Image stored in media/${category}/ successfully.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Image upload failed.";
      showNotification(errMsg, "error");
    } finally {
      setActionLoading(false);
      e.target.value = "";
    }
  };

  const handleDirectMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "projects" | "services" | "packages" | "site" | string = "projects"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setActionLoading(true);
    const validCat = ["projects", "services", "packages", "site"].includes(category)
      ? (category as "projects" | "services" | "packages" | "site")
      : "projects";

    try {
      const res = await api.uploadMedia(file, validCat, token);
      const updatedList = await api.getMediaList(token);
      setMediaFiles(updatedList);
      showNotification(`Asset uploaded successfully to ${res.url}.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Media upload failed.";
      showNotification(errMsg, "error");
    } finally {
      setActionLoading(false);
      e.target.value = "";
    }
  };

  const handleDeleteMedia = async (item: MediaItem) => {
    if (!token) return;
    if (item.in_use) {
      showNotification(
        `Cannot delete "${item.filename}": still referenced by ${item.references.join(", ")}.`,
        "error"
      );
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete "${item.filename}" from disk?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.deleteMedia(item.url, token);
      setMediaFiles((prev) => prev.filter((m) => m.url !== item.url));
      showNotification(`Media asset "${item.filename}" removed.`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete media asset.";
      showNotification(errMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyPath = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`Copied "${text}" to clipboard.`);
    } catch {
      showNotification("Could not copy to clipboard.", "error");
    }
  };

  // --- Service Handlers ---
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      title: "",
      slug: "",
      description: "",
      full_description: "",
      order: services.length + 1,
      active: true,
      featuresInput: "",
    });
    setIsServiceFormOpen(true);
  };

  const handleOpenEditService = (svc: ServiceItem) => {
    setEditingService(svc);
    setServiceForm({
      title: svc.title,
      slug: svc.slug || "",
      description: svc.description,
      full_description: "",
      order: svc.order ?? 0,
      active: svc.active ?? true,
      featuresInput: svc.features ? svc.features.join("\n") : "",
    });
    setIsServiceFormOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);

    const featuresArray = serviceForm.featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload: Partial<ServiceItem> = {
      title: serviceForm.title,
      slug:
        serviceForm.slug.trim() ||
        serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: serviceForm.description,
      order: Number(serviceForm.order),
      active: Boolean(serviceForm.active),
      features: featuresArray,
    };

    try {
      if (editingService) {
        const updated = await api.updateService(editingService.id, payload, token);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showNotification(`Service "${updated.title}" updated.`);
      } else {
        const created = await api.createService(payload, token);
        setServices((prev) => [...prev, created]);
        showNotification(`Service "${created.title}" created.`);
      }
      setIsServiceFormOpen(false);
      api.getAdminStats(token).then((res) => setStats(res)).catch(() => null);
    } catch {
      showNotification("Failed to save service.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!token || !deleteConfirmService) return;
    setActionLoading(true);
    try {
      await api.deleteService(deleteConfirmService.id, token);
      setServices((prev) => prev.filter((s) => s.id !== deleteConfirmService.id));
      showNotification(`Service "${deleteConfirmService.title}" deleted.`);
      setDeleteConfirmService(null);
      api.getAdminStats(token).then((res) => setStats(res)).catch(() => null);
    } catch {
      showNotification("Failed to delete service.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Package Handlers ---
  const handleOpenEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      price: pkg.price,
      formatted_price: pkg.formatted_price,
      currency: pkg.currency || "MMK",
      short_description: pkg.short_description,
      description: pkg.description,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
      suitable_for: pkg.suitable_for || "",
    });
    setIsPackageFormOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingPackage) return;
    setActionLoading(true);

    try {
      const updated = await api.updatePackage(editingPackage.id, packageForm, token);
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showNotification(`Package "${updated.name}" updated.`);
      setIsPackageFormOpen(false);
    } catch {
      showNotification("Failed to update package.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Inquiries Status Handler ---
  const handleStatusChange = async (id: number, status: string) => {
    if (!token) return;
    try {
      const updated = await api.updateInquiryStatus(id, status, token);
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? updated : inq)));
      showNotification(`Inquiry status updated to ${status.toUpperCase()}.`);
    } catch {
      showNotification("Failed to update inquiry status.", "error");
    }
  };

  // --- Settings & Home Content Handlers ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !siteSettings) return;
    setActionLoading(true);
    try {
      const updated = await api.updateAdminSettings(siteSettings, token);
      setSiteSettings(updated);
      showNotification("Studio site settings saved.");
    } catch {
      showNotification("Failed to save settings.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveHomeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !homeContent) return;
    setActionLoading(true);
    try {
      const updated = await api.updateAdminHomeContent(homeContent, token);
      setHomeContent(updated);
      showNotification("Homepage content updated.");
    } catch {
      showNotification("Failed to update homepage content.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  // Calculate published projects count
  const publishedCount = projects.filter((p) => p.published).length;

  return (
    <div className="flex min-h-screen bg-[#FFFFFF] text-[#09090b]">
      
      {/* Toast Notification Banner */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg transition-all ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* LEFT SIDEBAR                                                   */}
      {/* ============================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-[#FFFFFF] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
          <div className="flex flex-col">
            <span className="font-sans text-sm font-extrabold uppercase tracking-tight text-zinc-950">
              Next Aura
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Admin CMS
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-4">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "projects", label: "Projects", icon: Briefcase, badge: projects.length },
            { id: "media", label: "Media Storage", icon: ImageIcon, badge: mediaFiles.length },
            { id: "services", label: "Services", icon: Layers, badge: services.length },
            { id: "packages", label: "Packages", icon: Tag, badge: packages.length },
            { id: "technologies", label: "Technologies", icon: Code2 },
            { id: "home", label: "Home Content", icon: FileText },
            { id: "settings", label: "Site Settings", icon: Sliders },
            { id: "inquiries", label: "Inquiries", icon: Inbox, badge: inquiries.filter((i) => i.status === "new").length },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                      isActive ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: View Site & Logout */}
        <div className="border-t border-zinc-200 p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <span>Live Website</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA                                              */}
      {/* ============================================================== */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-[#F8F8F8]">
        
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 backdrop-blur-md px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Admin Portal / <span className="text-zinc-900 font-semibold">{activeTab}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => token && loadAllData(token)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          
          {/* ========================================================== */}
          {/* 1. DASHBOARD OVERVIEW TAB                                  */}
          {/* ========================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  Live operational statistics queried directly from PostgreSQL.
                </p>
              </div>

              {/* Exact Statistics Specified in Prompt */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    Projects
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950">
                    {stats?.projects_count ?? projects.length}
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-400">
                    Total in database
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    Published
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600">
                    {stats?.published_projects_count ?? publishedCount}
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-400">
                    Live on Selected Work
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    Services
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950">
                    {stats?.services_count ?? services.length}
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-400">
                    Active capabilities
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    Packages
                  </div>
                  <div className="text-3xl font-extrabold text-zinc-950">
                    {stats?.packages_count ?? packages.length}
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-400">
                    Investment tiers
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Briefs */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                
                {/* Left: Quick Actions */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                    <h2 className="font-sans text-sm font-bold uppercase tracking-tight text-zinc-950 mb-4">
                      Content Operations
                    </h2>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setActiveTab("projects");
                          handleOpenAddProject();
                        }}
                        className="flex w-full items-center justify-between rounded-lg bg-zinc-950 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors"
                      >
                        <span>Add New Project</span>
                        <Plus className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setActiveTab("projects")}
                        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 transition-colors"
                      >
                        <span>Manage Projects</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab("services")}
                        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 transition-colors"
                      >
                        <span>Manage Services</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab("inquiries")}
                        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 transition-colors"
                      >
                        <span>Client Inquiries ({inquiries.length})</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Published Projects Preview */}
                <div className="lg:col-span-8">
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-sans text-sm font-bold uppercase tracking-tight text-zinc-950">
                        Live Homepage Showcase
                      </h2>
                      <span className="font-mono text-xs text-zinc-400">
                        {publishedCount} Projects Live
                      </span>
                    </div>

                    <div className="space-y-3">
                      {projects.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/60 p-3.5"
                        >
                          <div>
                            <div className="font-bold text-xs text-zinc-900">{p.title}</div>
                            <div className="font-mono text-[11px] text-zinc-500">{p.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.featured && (
                              <span className="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                                FEATURED
                              </span>
                            )}
                            <span
                              className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold ${
                                p.published
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {p.published ? "PUBLISHED" : "DRAFT"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. PROJECTS MANAGEMENT TAB (PART 2)                        */}
          {/* ========================================================== */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                    Projects Management
                  </h1>
                  <p className="mt-1 text-xs text-zinc-500 font-mono">
                    Published projects automatically render as clickable cards on the homepage Selected Work section.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProject}
                  className="group inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors self-start"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Projects Table */}
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
                {projects.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="font-mono text-sm text-zinc-500 mb-4">No projects yet in database.</p>
                    <button
                      onClick={handleOpenAddProject}
                      className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add First Project</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-zinc-200 bg-zinc-50 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                        <tr>
                          <th className="py-3.5 px-4">Order</th>
                          <th className="py-3.5 px-4">Title</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Featured</th>
                          <th className="py-3.5 px-4">Published Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {projects.map((proj) => (
                          <tr key={proj.id} className="hover:bg-zinc-50/70 transition-colors">
                            
                            {/* Order */}
                            <td className="py-4 px-4 font-mono font-bold text-zinc-400">
                              #{proj.order ?? 0}
                            </td>

                            {/* Title & Slug */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-zinc-950 text-sm">{proj.title}</div>
                              <div className="font-mono text-[11px] text-zinc-400">/{proj.slug}</div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4 font-mono text-zinc-600">
                              {proj.category}
                            </td>

                            {/* Featured Toggle */}
                            <td className="py-4 px-4">
                              <button
                                onClick={() => handleToggleFeatured(proj)}
                                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors ${
                                  proj.featured
                                    ? "bg-zinc-950 text-white"
                                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                }`}
                              >
                                {proj.featured ? "★ FEATURED" : "Standard"}
                              </button>
                            </td>

                            {/* Published Status Toggle */}
                            <td className="py-4 px-4">
                              <button
                                onClick={() => handleTogglePublished(proj)}
                                className={`rounded-full px-3 py-1 font-mono text-[10px] font-semibold transition-colors ${
                                  proj.published
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                }`}
                              >
                                {proj.published ? "● PUBLISHED" : "○ DRAFT"}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/projects/${proj.slug}`}
                                  target="_blank"
                                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
                                  title="View on public site"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>

                                <button
                                  onClick={() => handleOpenEditProject(proj)}
                                  className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                                  title="Edit Project"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => setDeleteConfirmProject(proj)}
                                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. SERVICES MANAGEMENT TAB                                 */}
          {/* ========================================================== */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                    Services & Capabilities
                  </h1>
                  <p className="mt-1 text-xs text-zinc-500 font-mono">
                    Controls the &quot;WHAT WE BUILD&quot; section positioned directly above the Footer.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddService}
                  className="group inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 transition-colors self-start"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="py-3.5 px-4">Order</th>
                      <th className="py-3.5 px-4">Title</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Active</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {services.map((svc) => (
                      <tr key={svc.id} className="hover:bg-zinc-50/70">
                        <td className="py-4 px-4 font-mono font-bold text-zinc-400">
                          #{svc.order ?? 0}
                        </td>
                        <td className="py-4 px-4 font-bold text-zinc-950">
                          {svc.title}
                        </td>
                        <td className="py-4 px-4 text-zinc-600 max-w-md">
                          {svc.description}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold ${
                              svc.active ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {svc.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditService(svc)}
                              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmService(svc)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 4. PACKAGES MANAGEMENT TAB                                 */}
          {/* ========================================================== */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Investment Packages
                </h1>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  Manage fixed engineering investment tiers (Starter, Business, Enterprise).
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                          Tier #{pkg.sort_order}
                        </span>
                        {pkg.is_popular && (
                          <span className="rounded bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <h3 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-950">
                        {pkg.name}
                      </h3>
                      <div className="mt-2 text-2xl font-extrabold text-zinc-950">
                        {pkg.formatted_price}
                      </div>
                      <p className="mt-3 text-xs text-zinc-600 leading-relaxed">
                        {pkg.short_description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEditPackage(pkg)}
                      className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-100"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Tier Details</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 5. TECHNOLOGIES OVERVIEW TAB                               */}
          {/* ========================================================== */}
          {activeTab === "technologies" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Technology Stack Directory
                </h1>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  Aggregated technologies mapped across all portfolio systems.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from(
                  new Set(
                    projects.flatMap((p) => (p.technologies ? p.technologies.map((t) => t.name) : []))
                  )
                ).map((techName) => {
                  const associatedProjects = projects.filter((p) =>
                    p.technologies?.some((t) => t.name.toLowerCase() === techName.toLowerCase())
                  );
                  return (
                    <div key={techName} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <Code2 className="h-4 w-4 text-zinc-600" />
                        <h3 className="font-bold text-sm text-zinc-950">{techName}</h3>
                      </div>
                      <div className="font-mono text-xs text-zinc-500">
                        Used in {associatedProjects.length} project{associatedProjects.length > 1 ? "s" : ""}:
                      </div>
                      <div className="mt-2 space-y-1">
                        {associatedProjects.map((p) => (
                          <div key={p.id} className="font-mono text-[11px] text-zinc-700">
                            • {p.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 6. HOME CONTENT TAB                                        */}
          {/* ========================================================== */}
          {activeTab === "home" && homeContent && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Homepage Editorial Content
                </h1>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  Update hero statements, studio philosophy, and consultation CTA copy.
                </p>
              </div>

              <form onSubmit={handleSaveHomeContent} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Hero Headline
                  </label>
                  <textarea
                    rows={4}
                    value={homeContent.hero_headline}
                    onChange={(e) => setHomeContent({ ...homeContent, hero_headline: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 p-3 font-mono text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Hero Supporting Service Line
                  </label>
                  <input
                    type="text"
                    value={homeContent.hero_description}
                    onChange={(e) => setHomeContent({ ...homeContent, hero_description: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                      About Headline
                    </label>
                    <input
                      type="text"
                      value={homeContent.about_headline}
                      onChange={(e) => setHomeContent({ ...homeContent, about_headline: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                      CTA Headline
                    </label>
                    <input
                      type="text"
                      value={homeContent.cta_headline}
                      onChange={(e) => setHomeContent({ ...homeContent, cta_headline: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    About Description
                  </label>
                  <textarea
                    rows={3}
                    value={homeContent.about_description}
                    onChange={(e) => setHomeContent({ ...homeContent, about_description: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Studio Philosophy Statement
                  </label>
                  <textarea
                    rows={2}
                    value={homeContent.about_callout}
                    onChange={(e) => setHomeContent({ ...homeContent, about_callout: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-zinc-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
                >
                  {actionLoading ? "Saving..." : "Save Homepage Content"}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* 7. SITE SETTINGS TAB                                       */}
          {/* ========================================================== */}
          {activeTab === "settings" && siteSettings && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Studio Site Settings
                </h1>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  Global studio parameters, contact routing email, and domain settings.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.brand_name}
                    onChange={(e) => setSiteSettings({ ...siteSettings, brand_name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                      Contact Inquiries Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={siteSettings.domain}
                      onChange={(e) => setSiteSettings({ ...siteSettings, domain: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-zinc-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
                >
                  {actionLoading ? "Saving..." : "Save Site Settings"}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* 8. INQUIRIES TAB                                           */}
          {/* ========================================================== */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Client Briefs & Inquiries
                </h1>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  Submissions captured directly from the website project consultation form.
                </p>
              </div>

              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 font-mono text-sm">
                    No client inquiries recorded in database yet.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-colors hover:border-zinc-300"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-zinc-950">{inq.name}</span>
                            <a
                              href={`mailto:${inq.email}`}
                              className="font-mono text-xs text-zinc-500 hover:text-zinc-950 underline"
                            >
                              {inq.email}
                            </a>
                            {inq.company && (
                              <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-700">
                                {inq.company}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs text-zinc-500">
                            {inq.service_interest && (
                              <div>
                                Scope: <span className="text-zinc-800 font-semibold">{inq.service_interest}</span>
                              </div>
                            )}
                            {inq.budget && (
                              <div>
                                Budget: <span className="text-zinc-800 font-semibold">{inq.budget}</span>
                              </div>
                            )}
                            <div>
                              Date:{" "}
                              <span className="text-zinc-500">
                                {new Date(inq.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Select */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase text-zinc-400">Status:</span>
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            className={`rounded-lg border px-3 py-1 font-mono text-xs font-semibold focus:outline-hidden ${
                              inq.status === "new"
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : inq.status === "in_review"
                                ? "border-amber-300 bg-amber-50 text-amber-800"
                                : inq.status === "responded"
                                ? "border-blue-300 bg-blue-50 text-blue-800"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            <option value="new">NEW</option>
                            <option value="in_review">IN REVIEW</option>
                            <option value="responded">RESPONDED</option>
                            <option value="archived">ARCHIVED</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg bg-zinc-50 p-4 font-mono text-xs text-zinc-700 leading-relaxed border border-zinc-100">
                        {inq.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 9. MEDIA STORAGE TAB                                       */}
          {/* ========================================================== */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                    Media Storage Library
                  </h1>
                  <p className="mt-1 text-xs text-zinc-500 font-mono">
                    Partitioned asset storage across projects, services, packages, and site.
                  </p>
                </div>

                {/* Direct Upload Button */}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 shadow-xs">
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Asset</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleDirectMediaUpload(
                        e,
                        mediaCategoryFilter === "all" ? "projects" : mediaCategoryFilter
                      )
                    }
                    className="hidden"
                    disabled={actionLoading}
                  />
                </label>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
                {["all", "projects", "services", "packages", "site"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMediaCategoryFilter(cat)}
                    className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                      mediaCategoryFilter === cat
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {cat} ({cat === "all" ? mediaFiles.length : mediaFiles.filter((m) => m.category === cat).length})
                  </button>
                ))}
              </div>

              {/* Media Items Grid */}
              {mediaFiles.filter((m) => mediaCategoryFilter === "all" || m.category === mediaCategoryFilter).length === 0 ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
                  <FolderArchive className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                  <p className="text-sm font-semibold text-zinc-800">No media assets found</p>
                  <p className="text-xs text-zinc-500 mt-1">Upload images to populate the storage library.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaFiles
                    .filter((m) => mediaCategoryFilter === "all" || m.category === mediaCategoryFilter)
                    .map((item) => (
                      <div
                        key={item.url}
                        className="group rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs hover:border-zinc-400 transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getMediaUrl(item.url)}
                            alt={item.filename}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute top-2 left-2 rounded-md bg-zinc-900/80 backdrop-blur-xs px-2 py-0.5 font-mono text-[10px] uppercase text-white">
                            {item.category}
                          </span>
                          {item.in_use && (
                            <span className="absolute top-2 right-2 rounded-md bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 font-mono text-[10px] text-white font-semibold">
                              In Use
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-semibold text-zinc-900 truncate" title={item.filename}>
                              {item.filename}
                            </div>
                            <div className="font-mono text-[11px] text-zinc-400 mt-0.5">
                              {(item.size / 1024).toFixed(1)} KB
                            </div>
                            {item.references && item.references.length > 0 && (
                              <div
                                className="mt-1 text-[10px] text-zinc-500 line-clamp-1"
                                title={item.references.join(", ")}
                              >
                                Ref: {item.references.join(", ")}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                            <button
                              type="button"
                              onClick={() => handleCopyPath(item.url)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 hover:text-zinc-950"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copy Path</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(item)}
                              disabled={item.in_use || actionLoading}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                item.in_use
                                  ? "text-zinc-300 cursor-not-allowed"
                                  : "text-red-600 hover:text-red-800"
                              }`}
                              title={item.in_use ? "Cannot delete: file is currently in use" : "Delete asset"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ============================================================== */}
      {/* PROJECT FORM MODAL (ADD / EDIT)                                */}
      {/* ============================================================== */}
      {isProjectFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
              <div>
                <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-950">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h2>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  {editingProject
                    ? `Modifying ${editingProject.title}`
                    : "Fill in project specifications. Publishing makes it immediately visible on the homepage."}
                </p>
              </div>
              <button
                onClick={() => setIsProjectFormOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. RUBIS — Luxury Ruby Marketplace"
                    className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                    placeholder="e.g. rubis (auto-generated if empty)"
                    className="w-full rounded-xl border border-zinc-200 p-3 text-sm font-mono focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    placeholder="e.g. Luxury E-Commerce & Marketplace"
                    className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={projectForm.order}
                    onChange={(e) => setProjectForm({ ...projectForm, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 p-3 text-sm font-mono focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                  Project Description & Architectural Scope *
                </label>
                <textarea
                  rows={4}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Describe the system architecture, capabilities, and business impact..."
                  className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={projectForm.technologiesInput}
                  onChange={(e) => setProjectForm({ ...projectForm, technologiesInput: e.target.value })}
                  placeholder="Next.js, TypeScript, FastAPI, PostgreSQL, Redis"
                  className="w-full rounded-xl border border-zinc-200 p-3 text-sm font-mono focus:border-zinc-950 focus:outline-hidden"
                />
              </div>

              {/* Media Asset: Thumbnail / Cover Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600">
                    Project Thumbnail Asset
                  </label>
                  {projectForm.image_url && (
                    <span className="font-mono text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md truncate max-w-[280px]">
                      {projectForm.image_url}
                    </span>
                  )}
                </div>

                {projectForm.image_url ? (
                  <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative aspect-16/10 w-full sm:w-44 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getMediaUrl(projectForm.image_url)}
                          alt="Project thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                        <div className="text-xs font-medium text-zinc-900">
                          Stored in media/projects/
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 shadow-xs">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Replace Image</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => handleProjectImageUpload(e, "projects")}
                              className="hidden"
                              disabled={actionLoading}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setProjectForm((prev) => ({ ...prev, image_url: "" }))}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 p-6 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer ${actionLoading ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="rounded-full bg-white p-2.5 shadow-xs border border-zinc-200 text-zinc-600">
                      {actionLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-950" />
                      ) : (
                        <UploadCloud className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-900">
                        {actionLoading ? "Uploading asset to media/projects/..." : "Click to upload project thumbnail"}
                      </span>
                      <p className="mt-1 text-[11px] text-zinc-500 font-mono">
                        Supports WebP, PNG, JPEG (up to 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleProjectImageUpload(e, "projects")}
                      className="hidden"
                      disabled={actionLoading}
                    />
                  </label>
                )}
              </div>

              {/* Live URL & GitHub URL */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    Live System URL (optional)
                  </label>
                  <input
                    type="url"
                    value={projectForm.live_url}
                    onChange={(e) => setProjectForm({ ...projectForm, live_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-zinc-200 p-3 text-sm font-mono focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                    GitHub URL (optional)
                  </label>
                  <input
                    type="url"
                    value={projectForm.github_url}
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-zinc-200 p-3 text-sm font-mono focus:border-zinc-950 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Toggles: Published & Featured */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.published}
                    onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block">Published</span>
                    <span className="text-[11px] text-zinc-500">Live on public website</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block">Featured</span>
                    <span className="text-[11px] text-zinc-500">Display on homepage Selected Work</span>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsProjectFormOpen(false)}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{editingProject ? "Update Project" : "Publish Project"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-red-600 mb-2">
              Confirm Project Deletion
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-zinc-950">&quot;{deleteConfirmProject.title}&quot;</span>? This will immediately remove it from the database and homepage Selected Work.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmProject(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteProject}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-700"
              >
                {actionLoading ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SERVICE FORM MODAL                                             */}
      {/* ============================================================== */}
      {isServiceFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
              <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-950">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button onClick={() => setIsServiceFormOpen(false)}>
                <X className="h-5 w-5 text-zinc-400 hover:text-zinc-950" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. CUSTOM SOFTWARE"
                  className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                  Summary Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Concise statement shown on homepage What We Build section..."
                  className="w-full rounded-xl border border-zinc-200 p-3 text-sm focus:border-zinc-950 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                  <input
                    type="checkbox"
                    checked={serviceForm.active}
                    onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950"
                  />
                  <span>Active & Visible</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsServiceFormOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE SERVICE MODAL                                           */}
      {/* ============================================================== */}
      {deleteConfirmService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h3 className="font-sans text-lg font-bold uppercase tracking-tight text-red-600 mb-2">
              Confirm Service Deletion
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed mb-6">
              Delete service <span className="font-bold text-zinc-950">&quot;{deleteConfirmService.title}&quot;</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmService(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteService}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PACKAGE EDIT MODAL                                             */}
      {/* ============================================================== */}
      {isPackageFormOpen && editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-950 mb-4">
              Edit Package: {editingPackage.name}
            </h2>
            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1">
                  Formatted Price
                </label>
                <input
                  type="text"
                  required
                  value={packageForm.formatted_price}
                  onChange={(e) => setPackageForm({ ...packageForm, formatted_price: e.target.value })}
                  placeholder="e.g. 2,000,000 MMK"
                  className="w-full rounded-xl border border-zinc-200 p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-zinc-600 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={packageForm.short_description}
                  onChange={(e) => setPackageForm({ ...packageForm, short_description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                  <input
                    type="checkbox"
                    checked={packageForm.is_popular}
                    onChange={(e) => setPackageForm({ ...packageForm, is_popular: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950"
                  />
                  <span>Most Popular Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                  <input
                    type="checkbox"
                    checked={packageForm.is_active}
                    onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-950"
                  />
                  <span>Active Tier</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsPackageFormOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
