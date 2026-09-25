import { ArrowUpRight, Mail } from "lucide-react";
import { HomeContent, SiteSettings } from "@/types/api";

interface StartProjectProps {
  content: HomeContent;
  settings?: SiteSettings;
}

export default function StartProject({ content, settings }: StartProjectProps) {
  const email = settings?.email || "nextaura.innovation@gmail.com";

  return (
    <section id="contact" className="border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          {/* Headline */}
          <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6.5xl text-zinc-950 tracking-tight mb-6">
            {content.cta_headline || "START A PROJECT"}
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg leading-relaxed text-zinc-600 mb-10 max-w-xl">
            {content.cta_description ||
              "Tell us about your project, timeline, and goals. Let’s build something real together."}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${email}?subject=Project%20Inquiry%20-%20Next%20Aura%20Innovation`}
              className="group inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-zinc-800"
            >
              <span>{content.cta_button_text || "START A PROJECT"}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>

            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-800 transition-colors hover:border-zinc-950"
            >
              <Mail className="h-4 w-4 text-zinc-600" />
              <span>{email}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
