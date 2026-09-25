import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PackageCard from "@/components/packages/PackageCard";
import { api, defaultPackages, defaultSiteSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Packages & Systems — Next Aura INNOVATION",
  description:
    "Predictable, transparent investment tiers for high-performance web systems, custom FastAPI backends, and enterprise software.",
};

export default async function PackagesPage() {
  const [packages, siteSettings] = await Promise.all([
    api.getPackages().catch(() => defaultPackages),
    api.getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7xl text-zinc-950 tracking-tight mb-6">
                ENGINEERED SYSTEMS.<br />TRANSPARENT VALUE.
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-zinc-600 max-w-2xl">
                Clear, transparent engineering packages designed for businesses scaling from a high-performance digital presence to custom database-driven enterprise platforms.
              </p>
            </div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>

            {/* Custom Scope Studio Callout */}
            <div className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-8 sm:p-12">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-2">
                    Bespoke Architecture
                  </div>
                  <h3 className="font-sans text-2xl font-bold uppercase tracking-tight text-zinc-950">
                    Require custom specifications or technical advisory?
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 max-w-2xl">
                    For multi-tenant architectures, legacy data migrations, or dedicated engineering retainers, our studio provides customized scope proposals.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
                >
                  <span>Request Custom Scope</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
