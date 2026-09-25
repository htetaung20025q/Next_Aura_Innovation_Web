"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

interface HeaderProps {
  brandName?: string;
}

export default function Header({ brandName = "Next Aura INNOVATION" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Work", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "Packages", href: "/packages" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-3 w-3 rounded-full bg-zinc-950 transition-transform duration-300 group-hover:scale-125" />
          <span className="font-sans text-base font-extrabold uppercase tracking-tight text-zinc-950 sm:text-lg">
            {brandName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-zinc-950 font-bold"
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-950 bg-zinc-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-zinc-800"
          >
            <span>Start Project</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex p-2 text-zinc-900 md:hidden hover:text-zinc-600"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-semibold uppercase tracking-wider ${
                    isActive ? "text-zinc-950 font-bold" : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-zinc-100">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
              >
                <span>Start Project</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
