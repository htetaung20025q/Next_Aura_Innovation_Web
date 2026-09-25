import Link from "next/link";
import { ArrowUpRight, Cpu, Database, Globe } from "lucide-react";
import { HomeContent } from "@/types/api";

interface HeroProps {
  content: HomeContent;
}

export default function Hero({ content }: HeroProps) {
  const headlineLines = (content.hero_headline || "WE BUILD\nDIGITAL SYSTEMS\nFOR REAL\nBUSINESS.").split("\n");

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Left Column: Editorial Headline & Service Line */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Editorial Headline */}
            <h1 className="editorial-title text-4xl sm:text-6xl md:text-7xl lg:text-7.5xl text-zinc-950 mb-8 tracking-tighter">
              {headlineLines.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* Supporting Service Line */}
            <p className="text-base sm:text-lg font-medium text-zinc-600 mb-10 max-w-xl">
              {content.hero_description ||
                "Websites · E-Commerce · ERP · Business Systems · Custom Software"}
            </p>

            {/* Primary Action */}
            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-zinc-800"
              >
                <span>{content.hero_cta_text || "START A PROJECT"}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Architectural Specification Blueprint */}
          <div className="w-full lg:col-span-5">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-7 shadow-xs">
              <div className="mb-5 flex items-center justify-between border-b border-zinc-200/80 pb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Full-Stack Architecture
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  Layered Monolith
                </span>
              </div>

              {/* Architecture Core Stack */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl border border-zinc-200/90 bg-white p-3.5">
                  <Globe className="h-4 w-4 text-zinc-800 mb-2" />
                  <div className="text-xs font-bold text-zinc-950">Next.js</div>
                  <div className="text-[11px] text-zinc-500">App Router</div>
                </div>

                <div className="rounded-xl border border-zinc-200/90 bg-white p-3.5">
                  <Cpu className="h-4 w-4 text-zinc-800 mb-2" />
                  <div className="text-xs font-bold text-zinc-950">FastAPI</div>
                  <div className="text-[11px] text-zinc-500">Python 3.14</div>
                </div>

                <div className="rounded-xl border border-zinc-200/90 bg-white p-3.5">
                  <Database className="h-4 w-4 text-zinc-800 mb-2" />
                  <div className="text-xs font-bold text-zinc-950">PostgreSQL</div>
                  <div className="text-[11px] text-zinc-500">SQLAlchemy</div>
                </div>
              </div>

              {/* Data Flow Blueprint */}
              <div className="rounded-xl border border-zinc-200/90 bg-white p-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-3">
                  Request Execution Flow
                </div>
                <div className="flex items-center justify-between gap-1 py-1 font-mono text-[11px] text-zinc-700">
                  <span className="rounded bg-zinc-100 px-2.5 py-1 font-medium">Client</span>
                  <span className="text-zinc-300">──►</span>
                  <span className="rounded bg-zinc-100 px-2.5 py-1 font-medium">Router</span>
                  <span className="text-zinc-300">──►</span>
                  <span className="rounded bg-zinc-100 px-2.5 py-1 font-medium">Service</span>
                  <span className="text-zinc-300">──►</span>
                  <span className="rounded bg-zinc-950 px-2.5 py-1 font-medium text-white">Database</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
