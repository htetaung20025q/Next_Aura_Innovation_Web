import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceItem } from "@/types/api";

interface ServicesProps {
  services: ServiceItem[];
}

export default function Services({ services }: ServicesProps) {
  return (
    <section id="services" className="border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 pb-14 sm:pb-20 lg:flex-row lg:items-end border-b border-zinc-200">
          <div>
            <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6xl text-zinc-950 tracking-tight">
              WHAT WE BUILD
            </h2>
          </div>

          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-950 hover:underline"
          >
            <span>Explore All Capabilities</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Services List with Hairline Rows */}
        <div className="divide-y divide-zinc-200">
          {services.map((service, index) => {
            const serviceSlug =
              service.slug ||
              service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            return (
              <Link
                key={service.id || index}
                href={`/services/${serviceSlug}`}
                className="group grid grid-cols-1 items-start gap-4 py-8 transition-colors duration-200 hover:bg-zinc-50/70 sm:py-12 sm:grid-cols-12 sm:gap-8 block"
              >
                {/* Title */}
                <div className="sm:col-span-5">
                  <h3 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950 group-hover:translate-x-1 transition-transform">
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <p className="text-sm sm:text-base leading-relaxed text-zinc-600">
                    {service.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex sm:col-span-1 justify-end pt-1">
                  <ArrowUpRight className="h-5 w-5 text-zinc-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-950" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
