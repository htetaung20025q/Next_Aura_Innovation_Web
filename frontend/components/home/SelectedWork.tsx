import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Project } from "@/types/api";
import { getMediaUrl } from "@/lib/api";

interface SelectedWorkProps {
  projects: Project[];
  showViewAllCTA?: boolean;
}

export default function SelectedWork({ projects, showViewAllCTA = true }: SelectedWorkProps) {
  return (
    <section id="work" className="border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="mb-14 sm:mb-20 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6xl text-zinc-950 tracking-tight">
              SELECTED WORK
            </h2>
          </div>

          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-950 hover:underline"
          >
            <span>View All Projects</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-12 text-center text-zinc-500 font-mono text-sm">
            No published projects available yet. Projects published in the Admin CMS will appear here automatically.
          </div>
        ) : (
          /* Projects Grid: 2 Columns */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            {projects.map((project) => (
              <article
                key={project.id || project.slug}
                className="card-hover group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8"
              >
                {/* Card Meta & Category */}
                <div>
                  <div className="mb-4">
                    <span className="font-mono text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {project.category}
                    </span>
                  </div>

                  {/* Project Title */}
                  <Link href={`/projects/${project.slug}`}>
                    <h3 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 mb-3 group-hover:text-zinc-700 transition-colors">
                      {project.title}
                    </h3>
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
                  {(project.thumbnail_url || project.image_url) ? (
                    <div className="absolute inset-0 overflow-hidden bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(project.thumbnail_url || project.image_url)}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between">
                      {/* Mockup Header */}
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-900">
                          {project.title}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {project.category}
                        </span>
                      </div>

                      {/* Center Graphic */}
                      <div className="my-auto text-center py-4">
                        <div className="inline-block rounded-lg border border-zinc-200/80 bg-zinc-50 px-5 py-2.5 font-mono text-xs font-semibold text-zinc-900">
                          {project.title}
                        </div>
                      </div>

                      {/* Footer Stack Indicator */}
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
            ))}
          </div>
        )}

        {/* View All Projects CTA */}
        {showViewAllCTA && (
          <div className="mt-14 sm:mt-18 flex justify-center border-t border-zinc-200/80 pt-10 sm:pt-14">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2.5 rounded-full border border-zinc-950 bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-all duration-200 hover:bg-zinc-950 hover:text-white shadow-xs"
            >
              <span>VIEW ALL PROJECTS</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
