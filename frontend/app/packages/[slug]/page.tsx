import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, ShieldCheck, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { api, defaultPackages, defaultSiteSettings } from "@/lib/api";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const packages = await api.getPackages().catch(() => defaultPackages);
  return packages.map((pkg) => ({
    slug: pkg.slug,
  }));
}

export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await api.getPackageBySlug(slug);

  if (!pkg) {
    return {
      title: "Package Not Found — Next Aura INNOVATION",
    };
  }

  return {
    title: `${pkg.name} (${pkg.formatted_price}) — Next Aura INNOVATION`,
    description: pkg.short_description,
    openGraph: {
      title: `${pkg.name} — Next Aura INNOVATION`,
      description: pkg.description,
    },
  };
}

export default async function PackageDetailPage({ params }: PackagePageProps) {
  const { slug } = await params;
  const [pkg, siteSettings] = await Promise.all([
    api.getPackageBySlug(slug),
    api.getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* Back Link Breadcrumb */}
        <div className="border-b border-zinc-200/80 bg-zinc-50/50 py-4">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <Link
              href="/packages"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-950"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Packages</span>
            </Link>
          </div>
        </div>

        {/* Package Detail Hero */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
              
              {/* Left Column: Title, Price, Detailed Overview */}
              <div className="lg:col-span-7">
                {pkg.is_popular && (
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7xl text-zinc-950 tracking-tight mb-4">
                  {pkg.name}
                </h1>

                <div className="mb-6 flex items-baseline gap-3">
                  <span className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
                    {pkg.formatted_price}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                    Fixed Engineering Investment
                  </span>
                </div>

                <p className="text-base sm:text-lg leading-relaxed text-zinc-600 mb-8 max-w-2xl">
                  {pkg.description}
                </p>

                {/* Suitable Use Case */}
                {pkg.suitable_for && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 mb-8">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500 mb-2">
                      <Zap className="h-3.5 w-3.5 text-zinc-700" />
                      <span>Best Suited For</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900">
                      {pkg.suitable_for}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/contact?package=${pkg.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800 shadow-md"
                  >
                    <span>Get Started With {pkg.name}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-zinc-950 hover:text-zinc-950"
                  >
                    <span>Compare All Tiers</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Full Feature Checklist Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                      Included Deliverables
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {pkg.features.length} Capabilities
                    </span>
                  </div>

                  <div className="space-y-4">
                    {pkg.features.map((feature, idx) => (
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

                  {/* Guarantee / Studio Assurance */}
                  <div className="mt-8 border-t border-zinc-200 pt-6">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Clean code, full repository ownership, and documentation included.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="border-b border-zinc-200/80 bg-zinc-50/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="editorial-title text-2xl sm:text-4xl text-zinc-950 tracking-tight mb-4">
              Ready to build with Next Aura?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto mb-8">
              Reach out directly with your project requirements or schedule a consultation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
            >
              <span>Contact Our Engineers</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
