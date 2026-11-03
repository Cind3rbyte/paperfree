"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import { localizePath } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { tools } from "@/lib/tools";

export default function NotFound() {
  const { locale, t } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{t.notFound.kicker}</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">{t.notFound.title}</h1>
      <p className="mt-4 text-base text-slate-600 dark:text-slate-400">{t.notFound.text}</p>
      <Link
        href={localizePath(locale)}
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t.notFound.back}
      </Link>
      <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} locale={locale} compact />
        ))}
      </div>
    </div>
  );
}
