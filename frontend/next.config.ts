import type { NextConfig } from "next";

const backendBase =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:8000");

// Safe extraction of remote hostname from configured environment URLs
const extractHostname = (urlStr?: string): string | null => {
  if (!urlStr) return null;
  try {
    const url = new URL(urlStr);
    return url.hostname;
  } catch {
    return null;
  }
};

const customMediaHost = extractHostname(process.env.NEXT_PUBLIC_MEDIA_URL);
const customApiHost = extractHostname(process.env.NEXT_PUBLIC_API_URL);

const remotePatterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}> = [
  // Local development
  { protocol: "http", hostname: "localhost" },
  { protocol: "http", hostname: "127.0.0.1" },
  { protocol: "https", hostname: "localhost" },
  // AWS S3
  { protocol: "https", hostname: "**.amazonaws.com" },
  // Cloudflare R2
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
  { protocol: "https", hostname: "**.r2.dev" },
  // Supabase Storage
  { protocol: "https", hostname: "**.supabase.co" },
];

if (customMediaHost && !remotePatterns.some((p) => p.hostname === customMediaHost)) {
  remotePatterns.push({ protocol: "https", hostname: customMediaHost });
}
if (customApiHost && !remotePatterns.some((p) => p.hostname === customApiHost)) {
  remotePatterns.push({ protocol: "https", hostname: customApiHost });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${backendBase}/media/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
