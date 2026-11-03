import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ToolCard } from "@/components/ToolCard";
import { getTool, tools, type ToolId } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  toolId: ToolId;
  children: ReactNode;
  tips?: { title: string; text: string }[];
}

/** Gemeinsamer Rahmen aller Werkzeug-Seiten: Kopfbereich, Inhalt, Tipps und weitere Werkzeuge. */
export function ToolShell({ toolId, children, tips = [] }: ToolShellProps) {
  const tool = getTool(toolId);
  const Icon = tool.icon;
  const otherTools = tools.filter((entry) => entry.id !== toolId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <nav aria-label="Brotkrumen" className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-300">
          Start
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="font-medium text-slate-700 dark:text-slate-200">{tool.title}</span>
      </nav>

      <header className="flex items-start gap-4">
        <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", tool.gradient)}>
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{tool.title}</h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-400">{tool.description}</p>
          <PrivacyBadge className="mt-4" />
        </div>
      </header>

      <div className="mt-8">{children}</div>

      {tips.length > 0 && (
        <section aria-labelledby="tips-heading" className="mt-16">
          <h2 id="tips-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            Gut zu wissen
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {tips.map((tip) => (
              <div key={tip.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="font-semibold text-slate-900 dark:text-white">{tip.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="more-tools-heading" className="mt-16">
        <h2 id="more-tools-heading" className="text-xl font-bold text-slate-900 dark:text-white">
          Weitere Werkzeuge
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {otherTools.map((entry) => (
            <ToolCard key={entry.id} tool={entry} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
