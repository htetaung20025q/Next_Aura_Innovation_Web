import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Next Aura INNOVATION — Digital Studio & Software Engineering",
  description:
    "We build digital systems for real business. High-performance web applications, bespoke business platforms, and digital infrastructure.",
  keywords: [
    "Next Aura Innovation",
    "Digital Studio",
    "Software Engineering",
    "Custom Business Systems",
    "Web Applications",
  ],
  authors: [{ name: "Next Aura Innovation" }],
  openGraph: {
    title: "Next Aura INNOVATION — Digital Studio & Software Engineering",
    description:
      "We build digital systems for real business. High-performance web applications, bespoke business platforms, and digital infrastructure.",
    type: "website",
    locale: "en_US",
    siteName: "Next Aura INNOVATION",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-zinc-950 font-sans antialiased flex flex-col selection:bg-zinc-900 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
