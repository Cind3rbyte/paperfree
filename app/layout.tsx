import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { FileDropGuard } from "@/components/FileDropGuard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s · PaperFree – 100 % lokal & kostenlos",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "PDF zusammenfügen",
    "PDF teilen",
    "PDF komprimieren",
    "PDF drehen",
    "Bilder zu PDF",
    "PDF zu JPG",
    "PDF zu PNG",
    "Adobe Acrobat Alternative",
    "iLovePDF Alternative",
    "PDF ohne Upload",
    "Open Source PDF",
  ],
  authors: [{ name: "PaperFree Contributors", url: siteConfig.githubUrl }],
  creator: "PaperFree",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

/** Setzt das Farbschema vor dem ersten Rendern, damit nichts aufblitzt. */
const themeScript = `(function(){try{var s=localStorage.getItem("paperfree-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#inhalt"
          className="sr-only z-50 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Zum Inhalt springen
        </a>
        <FileDropGuard />
        <Header />
        <main id="inhalt" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
