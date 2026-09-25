import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Code2, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api, defaultServices, defaultSiteSettings } from "@/lib/api";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await api.getServices().catch(() => defaultServices);
  return services.map((s) => ({
    slug: s.slug || s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await api.getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found — Next Aura INNOVATION",
    };
  }

  return {
    title: `${service.title} — Next Aura INNOVATION`,
    description: service.description,
    openGraph: {
      title: `${service.title} — Next Aura INNOVATION`,
      description: service.description,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, siteSettings] = await Promise.all([
    api.getServiceBySlug(slug),
    api.getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-zinc-200/80 bg-zinc-50/50 py-4">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-950"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Services</span>
            </Link>
          </div>
        </div>

        {/* Service Hero */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
              
              {/* Left Column: Title & Description */}
              <div className="lg:col-span-7">
                <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7.5xl text-zinc-950 tracking-tight mb-8">
                  {service.title}
                </h1>

                <p className="text-base sm:text-lg leading-relaxed text-zinc-600 mb-10 max-w-2xl">
                  {service.description}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/contact?service=${service.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 shadow-md"
                  >
                    <span>Commission This Service</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-zinc-950 hover:text-zinc-950"
                  >
                    <span>View All Capabilities</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Capabilities Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-zinc-700" />
                      <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                        Core Competencies
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {service.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white">
                          <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                        </span>
                        <span className="text-sm font-medium text-zinc-800 leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-zinc-200 pt-6">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <Code2 className="h-4 w-4 text-zinc-700" />
                      <span>Next.js, FastAPI, PostgreSQL, and modern engineering standards.</span>
                    </div>
                  </div>
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
