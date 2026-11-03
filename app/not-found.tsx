import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Fehler 404</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
        Diese Seite gibt es nicht.
      </h1>
      <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
        Vielleicht suchst du eines dieser Werkzeuge? Alle laufen zu 100 % lokal in deinem Browser.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zur Startseite
      </Link>
      <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} compact />
        ))}
      </div>
    </div>
  );
}
