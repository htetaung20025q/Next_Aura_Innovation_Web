import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import SelectedWork from "@/components/home/SelectedWork";
import Services from "@/components/home/Services";
import Approach from "@/components/home/Approach";
import About from "@/components/home/About";
import StartProject from "@/components/home/StartProject";
import {
  api,
  defaultHomeContent,
  defaultProjects,
  defaultServices,
  defaultSiteSettings,
  approachSteps,
} from "@/lib/api";

// Ensure immediate real-time CMS publication updates
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [homeContent, siteSettings, rawProjects, rawServices] = await Promise.all([
    api.getHomeContent().catch(() => defaultHomeContent),
    api.getSiteSettings().catch(() => defaultSiteSettings),
    api.getProjects().catch(() => defaultProjects),
    api.getServices().catch(() => defaultServices),
  ]);

  // Database-driven project filtering & ordering
  const publishedProjects = (rawProjects || [])
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const featuredProjects = publishedProjects.filter((p) => p.featured === true);
  // Homepage strictly shows a maximum of 2 selected projects
  const selectedWorkProjects = (featuredProjects.length > 0 ? featuredProjects : publishedProjects).slice(0, 2);

  // Database-driven services filtering & ordering
  const activeServices = (rawServices || [])
    .filter((s) => s.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      {/* 1. Header Navigation */}
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero content={homeContent} />

        {/* 3. Selected Work (Database-driven published/featured projects) */}
        <SelectedWork projects={selectedWorkProjects} />

        {/* 4. Our Approach (Process Workflow) */}
        <Approach steps={approachSteps} />

        {/* 5. About (Studio Philosophy) */}
        <About content={homeContent} />

        {/* 6. Start a Project (Client Consultation Brief) */}
        <StartProject content={homeContent} settings={siteSettings} />

        {/* 7. What We Build (Directly above Footer) */}
        <Services services={activeServices} />
      </main>

      {/* 8. Footer */}
      <Footer settings={siteSettings} />
    </div>
  );
}
