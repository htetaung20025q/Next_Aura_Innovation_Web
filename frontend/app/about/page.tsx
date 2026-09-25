import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import About from "@/components/home/About";
import Approach from "@/components/home/Approach";
import {
  api,
  defaultHomeContent,
  defaultSiteSettings,
  approachSteps,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "About the Studio — Next Aura INNOVATION",
  description:
    "We are an engineering-driven digital studio building software systems and high-performance digital platforms for real businesses.",
};

export default async function AboutPage() {
  const [homeContent, siteSettings] = await Promise.all([
    api.getHomeContent().catch(() => defaultHomeContent),
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
                ABOUT NEXT AURA
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-zinc-600 max-w-2xl">
                We treat software not as disposable decoration, but as the operational core of modern enterprises. Minimalist aesthetics combined with rigorous full-stack engineering.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <About content={homeContent} />

        {/* Approach Section */}
        <Approach steps={approachSteps} />
      </main>

      <Footer settings={siteSettings} />
    </div>
  );
}
