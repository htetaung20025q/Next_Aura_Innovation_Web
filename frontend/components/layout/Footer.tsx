import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteSettings } from "@/types/api";

interface FooterProps {
  settings?: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const brandName = settings?.brand_name || "Next Aura INNOVATION";
  const email = settings?.email || "nextaura.innovation@gmail.com";
  const domain = settings?.domain || "nextaura.innovation.com";

  return (
    <footer className="border-t border-[#2A2A2A] bg-[#171717] text-[#FFFFFF] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          
          {/* Brand & Purpose Statement */}
          <div className="lg:col-span-6">
            <Link href="/" className="inline-block group">
              <span className="font-sans text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#FFFFFF] transition-opacity group-hover:opacity-90">
                {brandName}
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-[#A3A3A3]">
              Digital systems for real business.
            </p>
          </div>

          {/* Contact & Navigation Details */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:col-span-6">
            
            {/* Direct Inquiries & Domain */}
            <div className="space-y-6">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-[#A3A3A3] mb-2">
                  Contact
                </div>
                <a
                  href={`mailto:${email}?subject=Project%20Inquiry%20-%20Next%20Aura%20Innovation`}
                  className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-[#FFFFFF] hover:underline"
                >
                  <span>{email}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#A3A3A3] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FFFFFF]" />
                </a>
              </div>

              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-[#A3A3A3] mb-2">
                  Website
                </div>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs sm:text-sm text-[#A3A3A3] transition-colors hover:text-[#FFFFFF]"
                >
                  {domain}
                </a>
              </div>
            </div>

            {/* Studio Navigation Links */}
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#A3A3A3] mb-3">
                Navigation
              </div>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/projects" className="text-[#A3A3A3] transition-colors hover:text-[#FFFFFF]">
                    Work
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-[#A3A3A3] transition-colors hover:text-[#FFFFFF]">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/packages" className="text-[#A3A3A3] transition-colors hover:text-[#FFFFFF]">
                    Packages
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-[#A3A3A3] transition-colors hover:text-[#FFFFFF]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#A3A3A3] transition-colors hover:text-[#FFFFFF]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Hairline & Legal Bar */}
        <div className="mt-16 sm:mt-20 border-t border-[#2A2A2A] pt-8 flex flex-col items-start justify-between gap-4 font-mono text-xs text-[#A3A3A3] sm:flex-row sm:items-center">
          <div>
            {brandName}
          </div>
          <div suppressHydrationWarning>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
