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
import { faqEntries } from "@/components/home/faq-data";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools";

const stats = [
  { value: "0", label: "Uploads auf Server" },
  { value: "0 €", label: "Kosten, für immer" },
  { value: "∞", label: "Dateien & Seiten" },
  { value: "6", label: "PDF-Werkzeuge" },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Privatsphäre by Design",
    text: "Verträge, Steuerunterlagen, Arztbriefe: Deine Dateien bleiben auf deinem Gerät. Ideal für DSGVO-sensible Dokumente.",
  },
  {
    icon: Zap,
    title: "Blitzschnell",
    text: "Kein Hochladen, keine Warteschlange, kein Herunterladen vom Server. Die Verarbeitung startet sofort.",
  },
  {
    icon: InfinityIcon,
    title: "Keine Limits",
    text: "Keine Begrenzung bei Dateigröße, Seitenzahl oder Anzahl der Aufgaben pro Tag. Nutze PaperFree, so oft du willst.",
  },
  {
    icon: UserX,
    title: "Kein Konto, keine E-Mail",
    text: "Öffnen, Datei hineinziehen, fertig. Keine Registrierung, keine Newsletter-Falle, keine Abo-Upsells.",
  },
  {
    icon: Code,
    title: "100 % Open Source",
    text: "Der komplette Quellcode ist öffentlich unter MIT-Lizenz. Prüfe selbst, was mit deinen Dateien passiert.",
  },
  {
    icon: BadgeCheck,
    title: "Ohne Wasserzeichen & Werbung",
    text: "Saubere Ergebnisse ohne Branding, ohne Banner und ohne Cookie-Banner – weil es schlicht keine Cookies gibt.",
  },
];

const privacySteps = [
  {
    icon: FileUp,
    title: "Datei auswählen",
    text: "Deine PDF wird vom Browser direkt in den Arbeitsspeicher gelesen – nicht ins Internet.",
  },
  {
    icon: Cpu,
    title: "Lokal verarbeiten",
    text: "pdf-lib und pdf.js (JavaScript & WebAssembly) bearbeiten das Dokument in einem Web Worker auf deinem Gerät.",
  },
  {
    icon: Download,
    title: "Direkt speichern",
    text: "Das Ergebnis entsteht als lokale Datei und wird ohne Umweg über einen Server heruntergeladen.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteConfig.url,
      description: siteConfig.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      license: "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqEntries.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })),
    },
  ],
};

export default function HomePage() {
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
            Open Source · Kostenlos · Ohne Anmeldung
          </p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
            Alle PDF-Werkzeuge.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">
              Kostenlos & komplett privat.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
            PaperFree ist die quelloffene Alternative zu Adobe Acrobat und iLovePDF – nur ohne Upload, ohne Konto und ohne Limits.
            Alles läuft direkt in deinem Browser.
          </p>
          <div className="mt-8 flex justify-center">
            <PrivacyBadge size="lg" />
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#werkzeuge"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Werkzeug wählen
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              <GithubIcon className="size-5" />
              Quellcode ansehen
            </a>
          </div>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
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

      {/* Werkzeuge */}
      <section id="werkzeuge" aria-labelledby="tools-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="tools-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Was möchtest du tun?
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Wähle ein Werkzeug – deine Dateien werden in jedem Fall ausschließlich lokal verarbeitet.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Vorteile */}
      <section aria-labelledby="benefits-heading" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="benefits-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Warum PaperFree?
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Weil du für das Zusammenfügen von zwei PDFs weder ein Abo noch deine Daten hergeben solltest.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60"
              >
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

      {/* Datenschutz */}
      <section id="datenschutz" aria-labelledby="privacy-heading" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-12 text-white sm:px-12 dark:bg-slate-900/80 dark:ring-1 dark:ring-slate-800">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                So funktioniert der Datenschutz
              </p>
              <h2 id="privacy-heading" className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Deine Dateien verlassen niemals deinen Browser.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                Klassische Online-PDF-Dienste laden deine Dokumente auf ihre Server. PaperFree dreht das Prinzip um: Die Software
                kommt zu deinen Dateien – nicht umgekehrt.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
                <p className="font-semibold text-white">Technisch erzwungen, nicht nur versprochen</p>
                <p className="mt-1">
                  Eine Content-Security-Policy (<code className="rounded bg-white/10 px-1 text-emerald-300">connect-src &apos;self&apos;</code>)
                  verbietet der Seite jede Verbindung zu fremden Servern. Öffne die Entwicklertools (F12 → Netzwerk) und überzeuge dich
                  selbst.
                </p>
              </div>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {privacySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 lg:flex-row">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-900">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Schritt {index + 1}</p>
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

      {/* Vergleich */}
      <section id="vergleich" aria-labelledby="comparison-heading" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="comparison-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            PaperFree im Vergleich
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Ehrlich gegenübergestellt: Für die alltäglichen PDF-Aufgaben brauchst du kein Abo.
          </p>
        </div>
        <p className="mt-6 text-center text-xs font-medium text-slate-500 sm:hidden dark:text-slate-400">
          ← Tabelle seitlich wischen, um alle Anbieter zu sehen →
        </p>
        <div className="mt-4 sm:mt-10">
          <ComparisonTable />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-500">
          Stand: 2026. Angaben zu Drittanbietern ohne Gewähr; Funktionen und Preise können sich ändern.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-heading" className="mx-auto mt-24 max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Häufige Fragen
        </h2>
        <div className="mt-10 space-y-3">
          {faqEntries.map((entry) => (
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

      {/* Unterstützen */}
      <section aria-labelledby="support-heading" className="mx-auto mt-24 max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-5xl" aria-hidden="true">
          ☕
        </span>
        <h2 id="support-heading" className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Gefällt dir PaperFree?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
          PaperFree wird in der Freizeit entwickelt und bleibt für alle kostenlos. Mit einem Kaffee auf Ko-fi oder einem Stern auf
          GitHub hilfst du, neue Werkzeuge wie OCR, Signieren und Text-Bearbeitung umzusetzen.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <KofiButton size="lg" label="Buy Me a Coffee auf Ko-fi" />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <Star className="size-5 text-amber-500" aria-hidden="true" />
            Stern auf GitHub geben
          </a>
        </div>
      </section>
    </>
  );
}
