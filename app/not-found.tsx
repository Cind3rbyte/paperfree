import Link from "next/link";
import "./globals.css";

/** Fallback 404 for paths outside a language segment. Localized pages use app/[locale]/not-found.tsx. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Error 404 · Fehler 404</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Page not found · Seite nicht gefunden</h1>
          <p className="mt-6 flex justify-center gap-3">
            <Link href="/en" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
              English
            </Link>
            <Link href="/de" className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800">
              Deutsch
            </Link>
          </p>
        </div>
      </body>
    </html>
  );
}
