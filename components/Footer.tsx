import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import { KofiButton } from "@/components/KofiButton";
import { Logo } from "@/components/Logo";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 ring-1 ring-orange-200/70 sm:p-8 md:flex-row md:items-center dark:from-amber-500/10 dark:via-orange-500/10 dark:to-rose-500/10 dark:ring-orange-500/20">
          <div className="max-w-2xl">
            <p className="text-lg font-bold text-slate-900 dark:text-white">PaperFree ist kostenlos – und soll es bleiben. ☕</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Keine Werbung, kein Tracking, keine Abo-Falle. Wenn dir PaperFree Zeit oder Geld spart, hilft ein Kaffee dabei,
              das Projekt weiterzuentwickeln.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <KofiButton size="lg" label="Unterstütze mich auf Ko-fi" />
            {siteConfig.buyMeACoffeeUrl && <KofiButton size="lg" label="Buy Me a Coffee" href={siteConfig.buyMeACoffeeUrl} />}
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">{siteConfig.description}</p>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Keine Uploads · Keine Cookies · Kein Tracking
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Werkzeuge</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <Link href={tool.href} className="text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300">
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Open Source</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={siteConfig.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
                >
                  <GithubIcon className="size-4" /> Quellcode auf GitHub
                </a>
              </li>
              <li>
                <a
                  href={`${siteConfig.githubUrl}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
                >
                  Fehler melden & Ideen einreichen
                </a>
              </li>
              <li>
                <Link href="/#datenschutz" className="text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300">
                  So funktioniert der Datenschutz
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.kofiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
                >
                  ☕ Ko-fi / Buy Me a Coffee
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-500">
          <p>
            © {year} PaperFree · Open Source unter der {siteConfig.license}-Lizenz · Adobe, Acrobat und iLovePDF sind Marken ihrer
            jeweiligen Inhaber.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Gebaut mit <Heart className="size-3.5 fill-rose-500 text-rose-500" aria-label="Liebe" /> und pdf-lib, pdf.js & Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
