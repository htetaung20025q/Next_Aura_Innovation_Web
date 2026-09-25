import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api, defaultSiteSettings, getMediaUrl } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Projects & Systems — Next Aura INNOVATION",
  description:
    "Explore production software architectures, luxury commerce flagships, and resilient business systems engineered by Next Aura Innovation.",
};

interface ProjectsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { page: rawPage } = await searchParams;
  const currentPage = Math.max(1, parseInt(rawPage || "1", 10) || 1);
  const pageSize = 2;

  const [paginatedData, siteSettings] = await Promise.all([
    api.getProjectsPaginated(currentPage, pageSize),
    api.getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  const { items: projects, pagination } = paginatedData;

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7xl text-zinc-950 tracking-tight mb-6">
                ALL PROJECTS
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-zinc-600 max-w-2xl">
                A showcase of production software systems, luxury commerce flagships, and emergency infrastructure engineered with architectural discipline.
              </p>
              {pagination.total > 0 && (
                <div className="mt-6 font-mono text-xs text-zinc-500">
                  Showing {projects.length} of {pagination.total} published{" "}
                  {pagination.total === 1 ? "system" : "systems"} · Page {pagination.page} of {pagination.total_pages}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Projects Listing */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-16 text-center">
                <p className="text-base font-semibold text-zinc-900 mb-1">
                  No projects available yet.
                </p>
                <p className="text-xs font-mono text-zinc-500">
                  Published projects from the Admin CMS will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                {projects.map((project, index) => {
                  const displayImage = project.thumbnail_url || project.image_url;
                  const itemNumber = (pagination.page - 1) * pagination.page_size + index + 1;
                  const formattedIndex = String(itemNumber).padStart(2, "0");

                  return (
                    <article
                      key={project.id || project.slug}
                      className="group flex flex-col justify-between border-b border-zinc-200/80 pb-12 transition-colors duration-300"
                    >
                      <div>
                        {/* Meta Category & Numeric Index */}
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                            {project.category}
                          </span>
                          <span className="font-mono text-xs text-zinc-400 font-semibold">
                            {formattedIndex}
                          </span>
                        </div>

                        {/* Project Title */}
                        <Link href={`/projects/${project.slug}`}>
                          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 mb-3 group-hover:text-zinc-700 transition-colors">
                            {project.title}
                          </h2>
                        </Link>

                        {/* Project Description */}
                        <p className="text-sm sm:text-base leading-relaxed text-zinc-600 mb-8 max-w-md">
                          {project.description}
                        </p>
                      </div>

                      {/* Visual Canvas or Uploaded Image */}
                      <Link
                        href={`/projects/${project.slug}`}
                        className="relative mb-8 aspect-16/10 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-all duration-300 group-hover:border-zinc-400 block"
                      >
                        {displayImage ? (
                          <div className="absolute inset-0 overflow-hidden bg-zinc-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getMediaUrl(displayImage)}
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-900">
                                {project.title}
                              </span>
                              <span className="font-mono text-[10px] text-zinc-400">
                                {project.category}
                              </span>
                            </div>

                            <div className="my-auto text-center py-4">
                              <div className="inline-block rounded-lg border border-zinc-200/80 bg-zinc-50 px-5 py-2.5 font-mono text-xs font-semibold text-zinc-900">
                                {project.title}
                              </div>
                            </div>

                            <div className="border-t border-zinc-100 pt-2.5 font-mono text-[10px] text-zinc-400 text-right">
                              <span>Full-Stack Architecture</span>
                            </div>
                          </div>
                        )}
                      </Link>

                      {/* Technologies & CTA Link */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200/80 pt-6">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies?.map((tech) => (
                            <span
                              key={tech.slug || tech.name}
                              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-zinc-700"
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-transform group-hover:translate-x-1"
                        >
                          <span>View Project Details</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <nav
                aria-label="Projects pagination"
                className="mt-16 sm:mt-24 flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200/80 pt-10 sm:pt-14"
              >
                {/* Previous Button - Only shown when previous page exists */}
                {pagination.has_previous && (
                  <Link
                    href={`/projects?page=${pagination.page - 1}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:border-zinc-950 hover:bg-zinc-50 shadow-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </Link>
                )}

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5 mx-2">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((pageNum) => {
                    const isCurrent = pageNum === pagination.page;
                    return isCurrent ? (
                      <span
                        key={pageNum}
                        aria-current="page"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 font-mono text-xs font-bold text-white shadow-xs"
                      >
                        {pageNum}
                      </span>
                    ) : (
                      <Link
                        key={pageNum}
                        href={`/projects?page=${pageNum}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white font-mono text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-950 hover:text-zinc-950"
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {/* Next Button - Only shown when next page exists */}
                {pagination.has_next && (
                  <Link
                    href={`/projects?page=${pagination.page + 1}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:border-zinc-950 hover:bg-zinc-50 shadow-xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
