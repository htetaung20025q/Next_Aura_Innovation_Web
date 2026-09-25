import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Services from "@/components/home/Services";
import { api, defaultServices, defaultSiteSettings } from "@/lib/api";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Services & Capabilities — Next Aura INNOVATION",
  description:
    "Explore our core engineering capabilities: web experiences, business systems, e-commerce & ERP, and custom software.",
};

export default async function ServicesPage() {
  const [services, siteSettings] = await Promise.all([
    api.getServices().catch(() => defaultServices),
    api.getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  const activeServices = (services || [])
    .filter((s) => s.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7xl text-zinc-950 tracking-tight mb-6">
                WHAT WE BUILD
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-zinc-600 max-w-2xl">
                We craft bespoke digital flagships, automated operational business software, and enterprise commerce backbones built with architectural discipline.
              </p>
            </div>
          </div>
        </section>

        {/* Services Listing */}
        <Services services={activeServices} />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
