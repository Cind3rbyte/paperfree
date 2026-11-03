import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Code,
  Cpu,
  Download,
  FileUp,
  Infinity as InfinityIcon,
  ShieldCheck,
  Star,
  UserX,
  Zap,
} from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import { KofiButton } from "@/components/KofiButton";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ToolCard } from "@/components/ToolCard";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { localizePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

const benefitIcons = [ShieldCheck, Zap, InfinityIcon, UserX, Code, BadgeCheck];
const privacyStepIcons = [FileUp, Cpu, Download];

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const home = t.home;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `${siteConfig.url}${localizePath(locale)}`,
        inLanguage: locale,
        description: t.meta.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        license: "https://opensource.org/licenses/MIT",
      },
      {
        "@type": "FAQPage",
        inLanguage: locale,
        mainEntity: home.faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-12rem] -z-10 h-[36rem] w-[72rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/30 via-violet-400/20 to-emerald-300/20 blur-3xl dark:from-indigo-600/25 dark:via-violet-600/20 dark:to-emerald-500/10"
        />
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            {home.kicker}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
            {home.titleLine1}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">
              {home.titleLine2}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">{home.subtitle}</p>
          <div className="mt-8 flex justify-center">
            <PrivacyBadge locale={locale} size="lg" />
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#tools"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {home.ctaPrimary}
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              <GithubIcon className="size-5" />
              {home.ctaSecondary}
            </a>
          </div>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {home.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</dd>
                <dd className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" aria-labelledby="tools-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="tools-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {home.toolsHeading}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">{home.toolsSub}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} locale={locale} />
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-heading" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="benefits-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {home.benefitsHeading}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">{home.benefitsSub}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {home.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index % benefitIcons.length];
            return (
              <div key={benefit.title} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{benefit.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" aria-labelledby="privacy-heading" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-12 text-white sm:px-12 dark:bg-slate-900/80 dark:ring-1 dark:ring-slate-800">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {home.privacy.kicker}
              </p>
              <h2 id="privacy-heading" className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {home.privacy.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">{home.privacy.text}</p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
                <p className="font-semibold text-white">{home.privacy.enforcedTitle}</p>
                <p className="mt-1">
                  {home.privacy.enforcedBefore}
                  <code className="rounded bg-white/10 px-1 text-emerald-300">connect-src &apos;self&apos;</code>
                  {home.privacy.enforcedAfter}
                </p>
              </div>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {home.privacy.steps.map((step, index) => {
                const Icon = privacyStepIcons[index % privacyStepIcons.length];
                return (
                  <li key={step.title} className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 lg:flex-row">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">{home.privacy.stepLabel(index + 1)}</p>
                      <h3 className="mt-1 font-bold">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" aria-labelledby="comparison-heading" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="comparison-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {home.comparison.heading}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">{home.comparison.sub}</p>
        </div>
        <p className="mt-6 text-center text-xs font-medium text-slate-500 sm:hidden dark:text-slate-400">{home.comparison.swipeHint}</p>
        <div className="mt-4 sm:mt-10">
          <ComparisonTable locale={locale} />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">{home.comparison.disclaimer}</p>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="mx-auto mt-24 max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {home.faqHeading}
        </h2>
        <div className="mt-10 space-y-3">
          {home.faq.map((entry) => (
            <details
              key={entry.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white">
                {entry.question}
                <ChevronDown className="size-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Support */}
      <section aria-labelledby="support-heading" className="mx-auto mt-24 max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-5xl" aria-hidden="true">
          ☕
        </span>
        <h2 id="support-heading" className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {home.support.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">{home.support.text}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <KofiButton locale={locale} size="lg" label={home.support.kofi} />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <Star className="size-5 text-amber-500" aria-hidden="true" />
            {home.support.star}
          </a>
        </div>
      </section>
    </>
  );
}
