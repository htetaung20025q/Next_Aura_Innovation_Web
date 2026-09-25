import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowUpRight, Mail } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import { api, defaultSiteSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Start a Project & Contact — Next Aura INNOVATION",
  description:
    "Commission a digital system, custom web application, or enterprise platform from Next Aura Innovation.",
};

export default async function ContactPage() {
  const siteSettings = await api.getSiteSettings().catch(() => defaultSiteSettings);
  const email = siteSettings.email || "nextaura.innovation@gmail.com";

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header brandName={siteSettings.brand_name} />

      <main className="flex-1">
        <section className="border-b border-zinc-200/80 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
              
              {/* Left Column: Direct Consultation Info */}
              <div className="lg:col-span-5">
                <h1 className="editorial-title text-4xl sm:text-6xl text-zinc-950 tracking-tight mb-6">
                  START A PROJECT
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-zinc-600 mb-8">
                  Have an operational challenge, a new venture, or an existing system that needs architectural refactoring? Submit your brief or contact our engineering team directly.
                </p>

                <div className="space-y-4 border-t border-zinc-200 pt-6">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1">
                      Direct Email
                    </div>
                    <a
                      href={`mailto:${email}?subject=Project%20Inquiry%20-%20Next%20Aura%20Innovation`}
                      className="group inline-flex items-center gap-2 text-base font-medium text-zinc-950 hover:underline"
                    >
                      <Mail className="h-4 w-4 text-zinc-600" />
                      <span>{email}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>

                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1">
                      Domain Flagship
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      {siteSettings.domain}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Specification Form */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 sm:p-10">
                  <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-zinc-950 mb-6">
                    Project Specification Brief
                  </h2>
                  <Suspense fallback={<div className="py-12 text-center text-sm text-zinc-400">Loading form...</div>}>
                    <ContactForm />
                  </Suspense>
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
