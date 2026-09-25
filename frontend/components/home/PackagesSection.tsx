import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Package } from "@/types/api";
import PackageCard from "@/components/packages/PackageCard";

interface PackagesSectionProps {
  packages: Package[];
}

export default function PackagesSection({ packages }: PackagesSectionProps) {
  return (
    <section id="packages" className="border-b border-zinc-200/80 bg-white py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header Split */}
        <div className="grid grid-cols-1 items-end gap-8 pb-14 sm:pb-20 lg:grid-cols-12 lg:gap-16 border-b border-zinc-200">
          <div className="lg:col-span-7">
            <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6xl text-zinc-950 tracking-tight">
              ENGINEERED TIERS.<br />TRANSPARENT VALUE.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-between gap-4">
            <p className="text-base sm:text-lg leading-relaxed text-zinc-600">
              Clear engineering scopes designed for ambitious businesses scaling from a digital flagship to custom enterprise platforms.
            </p>
            <Link
              href="/packages"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-950 hover:underline"
            >
              <span>View All Package Details</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* 3 Package Cards */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
