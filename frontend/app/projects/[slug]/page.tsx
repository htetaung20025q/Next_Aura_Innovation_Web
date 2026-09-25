import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Cpu, Globe, Layers } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api, defaultProjects, defaultSiteSettings, getMediaUrl } from "@/lib/api";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await api.getProjects().catch(() => defaultProjects);
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await api.getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found — Next Aura INNOVATION",
    };
  }

  return {
    title: `${project.title} — Next Aura INNOVATION`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Next Aura INNOVATION`,
      description: project.description,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, siteSettings] = await Promise.all([
    api.getProjectBySlug(slug),
    api.getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  if (!project) {
    notFound();
  }

  const displayImage = project.thumbnail_url || project.image_url;

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-zinc-200/80 bg-zinc-50/50 py-4">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-950"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Selected Work</span>
            </Link>
          </div>
        </div>

        {/* Project Detail Header */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <div className="mb-4 font-mono text-xs uppercase tracking-wider text-zinc-500">
                {project.category}
              </div>

              <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7.5xl text-zinc-950 tracking-tight mb-8">
                {project.title}
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-zinc-600 mb-10 max-w-2xl">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="mb-10 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase text-zinc-400 mr-2">
                  Engineered With:
                </span>
                {project.technologies?.map((tech) => (
                  <span
                    key={tech.slug || tech.name}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs font-semibold text-zinc-800"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 shadow-sm"
                  >
                    <span>Visit Live System</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}

                <Link
                  href={`/contact?project=${project.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-zinc-950 hover:text-zinc-950"
                >
                  <span>Build Similar Architecture</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Project Visual Showcase */}
        {displayImage && (
          <section className="border-b border-zinc-200/80 bg-zinc-50/50 py-10 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
              <div className="relative aspect-16/9 sm:aspect-21/9 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(displayImage)}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* Project Architecture & System Canvas */}
        <section className="border-b border-zinc-200/80 bg-zinc-50/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-8">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-zinc-700" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800">
                    System Architecture Specification
                  </span>
                </div>
                <span className="font-mono text-xs text-zinc-500 font-semibold tracking-wider uppercase">
                  Production Deployment
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-8">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-5">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Globe className="h-4 w-4 text-zinc-700" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">Frontend Interface</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">Next.js & TypeScript</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Sub-second server-rendered pages with fluid interactive client hydration.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-5">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Cpu className="h-4 w-4 text-zinc-700" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">Backend API Engine</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">FastAPI & Python 3.14</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Strict Pydantic schemas, dependency injection, and layered repository design.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-5">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-zinc-700" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">Database & Storage</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">PostgreSQL Relational DB</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    ACID transaction guarantees, connection pooling, and Alembic migrations.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 text-zinc-300 font-mono text-xs">
                <div className="text-zinc-500 uppercase tracking-widest text-[10px] mb-2">
                  System Telemetry Snapshot
                </div>
                <div className="text-zinc-100 font-bold mb-1">
                  Project Identifier: {project.slug}.nextaurainnovation.com
                </div>
                <div className="text-zinc-400">
                  Data Pipeline: Browser Client ──► FastAPI Router ──► Service / Repo ──► PostgreSQL
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
