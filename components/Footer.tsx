import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import { KofiButton } from "@/components/KofiButton";
import { Logo } from "@/components/Logo";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  const linkClass = "text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300";

  return (
    <footer className="mt-24 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 ring-1 ring-orange-200/70 sm:p-8 md:flex-row md:items-center dark:from-amber-500/10 dark:via-orange-500/10 dark:to-rose-500/10 dark:ring-orange-500/20">
          <div className="max-w-2xl">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{t.footer.ctaTitle}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{t.footer.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <KofiButton locale={locale} size="lg" label={t.footer.ctaKofi} />
            {siteConfig.buyMeACoffeeUrl && (
              <KofiButton locale={locale} size="lg" label={t.footer.ctaBmc} href={siteConfig.buyMeACoffeeUrl} />
            )}
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo locale={locale} />
            <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.meta.description}</p>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t.footer.trustLine}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.footer.toolsHeading}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <Link href={localizePath(locale, tool.href)} className={linkClass}>
                    {t.tools[tool.id].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.footer.openSourceHeading}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${linkClass}`}>
                  <GithubIcon className="size-4" /> {t.footer.source}
                </a>
              </li>
              <li>
                <a href={`${siteConfig.githubUrl}/issues`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t.footer.issues}
                </a>
              </li>
              <li>
                <Link href={`${localizePath(locale)}#privacy`} className={linkClass}>
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <a href={siteConfig.kofiUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t.footer.kofi}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-500">
          <p>{t.footer.copyright(year, siteConfig.license)}</p>
          <p className="inline-flex items-center gap-1.5">
            {t.footer.builtWith} <Heart className="size-3.5 fill-rose-500 text-rose-500" aria-label={t.footer.love} />{" "}
            {t.footer.builtWithSuffix}
          </p>
        </div>
      </div>
    </footer>
  );
}
