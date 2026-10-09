import type { MetadataRoute } from "next";
import { PREVIEW_SITE } from "@/lib/preview-site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";

/** Everything public except the Studio, APIs and dev routes; preview deployments stay out of Google. */
export default function robots(): MetadataRoute.Robots {
  // Preview deployments and the client review site stay out of Google
  if ((process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") || PREVIEW_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/", "/dev/", "/en/dev/", "/it/dev/", "/de/dev/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
