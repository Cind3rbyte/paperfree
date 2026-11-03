import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <defs>
        <linearGradient id="paperfree-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#paperfree-logo)" />
      <path d="M10 7.5h8.2L23 12.3V23a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 9 23V9a1.5 1.5 0 0 1 1-1.5Z" fill="#fff" opacity=".95" />
      <path d="M18 7.5V11a1.3 1.3 0 0 0 1.3 1.3H23" fill="none" stroke="#c7d2fe" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m12.6 18.2 2.3 2.3 4.6-4.9" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500", className)}>
      <LogoMark className="transition group-hover:scale-105" />
      <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
        Paper<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Free</span>
      </span>
    </Link>
  );
}
