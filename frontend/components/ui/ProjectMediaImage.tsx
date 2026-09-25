"use client";

import { useState } from "react";
import { getMediaUrl } from "@/lib/api";

interface ProjectMediaImageProps {
  src?: string | null;
  alt: string;
  title: string;
  category: string;
  aspectClass?: string;
  showFooter?: boolean;
}

export default function ProjectMediaImage({
  src,
  alt,
  title,
  category,
  aspectClass = "aspect-16/10",
  showFooter = true,
}: ProjectMediaImageProps) {
  const [error, setError] = useState(false);
  const mediaUrl = getMediaUrl(src);

  if (mediaUrl && !error) {
    return (
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-xs transition-all duration-300 group-hover:border-zinc-400`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaUrl}
          alt={alt}
          onError={() => setError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  // Graceful fallback canvas
  return (
    <div className={`relative ${aspectClass} w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-all duration-300 group-hover:border-zinc-400`}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-900 truncate max-w-[200px]">
            {title}
          </span>
          <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[120px]">
            {category}
          </span>
        </div>

        <div className="my-auto text-center py-4">
          <div className="inline-block rounded-lg border border-zinc-200/80 bg-zinc-50 px-5 py-2.5 font-mono text-xs font-semibold text-zinc-900">
            {title}
          </div>
        </div>

        {showFooter && (
          <div className="border-t border-zinc-100 pt-2.5 font-mono text-[10px] text-zinc-400 text-right">
            <span>Full-Stack Architecture</span>
          </div>
        )}
      </div>
    </div>
  );
}
