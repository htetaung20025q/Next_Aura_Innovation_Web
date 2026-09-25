import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Package } from "@/types/api";

interface PackageCardProps {
  pkg: Package;
  featured?: boolean;
}

export default function PackageCard({ pkg, featured }: PackageCardProps) {
  const isPopular = featured ?? pkg.is_popular;

  return (
    <div
      className={`card-hover group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 ${
        isPopular
          ? "border-zinc-950 bg-white shadow-md ring-1 ring-zinc-950/5"
          : "border-zinc-200 bg-zinc-50/60 hover:border-zinc-400 hover:bg-white"
      } p-6 sm:p-8`}
    >
      <div>
        {/* Top Meta Bar */}
        {isPopular && (
          <div className="mb-4">
            <span className="inline-flex rounded-full bg-zinc-950 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
              MOST POPULAR
            </span>
          </div>
        )}

        {/* Package Title */}
        <h3 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-zinc-950">
          {pkg.name}
        </h3>

        {/* Price */}
        <div className="mt-3 mb-4 flex items-baseline gap-2">
          <span className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            {pkg.formatted_price}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-zinc-600 mb-8">
          {pkg.short_description}
        </p>

        {/* Divider */}
        <div className="hairline-divider mb-8 border-t border-zinc-200" />

        {/* Included Features */}
        <div className="space-y-3 mb-8">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800">
                <Check className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
              <span className="text-xs sm:text-sm text-zinc-700 leading-normal">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="pt-4 border-t border-zinc-200/80">
        <Link
          href={`/packages/${pkg.slug}`}
          className={`group/btn flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            isPopular
              ? "bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm"
              : "border border-zinc-300 bg-white text-zinc-950 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
          }`}
        >
          <span>View Package Details</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
