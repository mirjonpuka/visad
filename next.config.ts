import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
