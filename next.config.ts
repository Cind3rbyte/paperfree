import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Die Content-Security-Policy erzwingt technisch, was PaperFree verspricht:
 * `connect-src 'self'` verhindert, dass die Seite Daten an fremde Server senden kann.
 * Im Entwicklungsmodus wird sie weggelassen, weil Hot-Reloading `eval` und WebSockets benötigt.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  "connect-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(isProduction ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/pdfjs/:file*.mjs",
        headers: [{ key: "Content-Type", value: "text/javascript; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
