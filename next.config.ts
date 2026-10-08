import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const dev = process.env.NODE_ENV !== "production";

/*
 * Content-Security-Policy (Architecture §10). Pages are prerendered, so
 * nonces are not possible: inline scripts (Next.js payload, the motion head
 * script, JSON-LD) need 'unsafe-inline'; every external origin is listed.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.public.blob.vercel-storage.com",
  "media-src 'self' https://cdn.sanity.io",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.sanity-cdn.com https://challenges.cloudflare.com https://vercel.com https://*.blob.vercel-storage.com https://vitals.vercel-insights.com",
  "frame-src https://challenges.cloudflare.com https://www.google.com",
  // The Studio's Presentation tool shows the site in a same-origin iframe
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The embedded Studio loads its own resources; the site gets the strict policy
      { source: "/((?!studio).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
    ];
  },
  // Old WordPress URLs (Architecture §8)
  async redirects() {
    return [
      // www → apex (Phase 10); also set "Redirect to visad.al" on the Vercel domain
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.visad.al" }],
        destination: "https://visad.al/:path*",
        permanent: true,
      },
      { source: "/galeria", destination: "/projektet", permanent: true },
      { source: "/galeria/:path*", destination: "/projektet", permanent: true },
      { source: "/:slug(wp-.*)", destination: "/", permanent: true },
      { source: "/:slug(wp-.*)/:path*", destination: "/", permanent: true },
      { source: "/xmlrpc.php", destination: "/", permanent: true },
      { source: "/feed", destination: "/", permanent: true },
    ];
  },

  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The dev filesystem cache served stale globals.css (Tailwind loader) across
    // restarts; keep dev output always in sync with the files (DECISIONS D2.28).
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Architecture §5: AVIF/WebP only
    formats: ["image/avif", "image/webp"],
    qualities: [75, 78],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default withNextIntl(nextConfig);
