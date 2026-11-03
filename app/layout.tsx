import type { ReactNode } from "react";

/**
 * The real root layout (with <html> and <body>) lives in app/[locale]/layout.tsx so that
 * the lang attribute matches the language. This file only exists for app/not-found.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
