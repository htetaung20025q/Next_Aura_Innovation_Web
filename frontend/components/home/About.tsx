import { HomeContent } from "@/types/api";

interface AboutProps {
  content: HomeContent;
}

export default function About({ content }: AboutProps) {
  return (
    <section id="about" className="border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Section Header Split */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-16 mb-16 sm:mb-20">
          <div className="lg:col-span-6">
            <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6xl text-zinc-950 tracking-tight">
              {content.about_headline || "ABOUT NEXT AURA"}
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-base sm:text-lg leading-relaxed text-zinc-600">
              {content.about_description ||
                "Next Aura Innovation is an engineering-driven digital product studio. We build high-performance web systems, custom business platforms, and scalable software for organizations that prioritize reliability, clarity, and architectural integrity."}
            </p>
          </div>
        </div>

        {/* Studio Signature Dark Editorial Callout Banner */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-8 sm:p-14 lg:p-16 text-white shadow-lg">
          <p className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-zinc-100 max-w-3xl">
            {content.about_callout || "“Not just a website. A digital system built around how your business works.”"}
          </p>
        </div>

      </div>
    </section>
  );
}
