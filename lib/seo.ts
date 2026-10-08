import "server-only";
import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";
import { sanityImageUrl } from "@/sanity/lib/image";
import type { Seo } from "@/sanity/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";

type Options = {
  locale: string;
  pathname: AppPathname;
  /** Dynamic segment name + its slug per locale (detail pages) */
  param?: { key: "slug" | "segment"; slugs: Record<string, string> };
  title: string;
  description?: string | null;
  seo?: Seo;
};

function href(pathname: AppPathname, locale: string, param?: Options["param"]) {
  const value = param ? (param.slugs[locale] ?? param.slugs.sq ?? Object.values(param.slugs)[0]) : undefined;
  const target = (param ? { pathname, params: { [param.key]: value } } : pathname) as Parameters<
    typeof getPathname
  >[0]["href"];
  return SITE_URL + getPathname({ href: target, locale: locale as Locale });
}

/**
 * Page metadata (Architecture §6): CMS SEO fields win over the page title /
 * lead, canonical = this locale's URL, hreflang alternates for every locale
 * that has the page (+ x-default = Albanian).
 */
export function pageMetadata({ locale, pathname, param, title, description, seo }: Options): Metadata {
  const locales = param ? routing.locales.filter((l) => param.slugs[l]) : routing.locales;
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, href(pathname, l, param)]));
  languages["x-default"] = href(pathname, "sq", param);
  const photo = seo?.image?.assetId
    ? sanityImageUrl({ assetId: seo.image.assetId, crop: seo.image.crop ?? null }, 1200)
    : undefined;
  const finalTitle = seo?.title || title;
  const finalDescription = seo?.description || description || undefined;
  // Branded card from /api/og (title + photo when there is one)
  const og = new URL("/api/og", SITE_URL);
  og.searchParams.set("title", finalTitle);
  if (photo) og.searchParams.set("image", photo);
  const image = og.toString();

  return {
    title: finalTitle,
    description: finalDescription,
    alternates: { canonical: href(pathname, locale, param), languages },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: href(pathname, locale, param),
      siteName: "VISAD Construction",
      locale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: finalTitle }],
    },
    twitter: { card: "summary_large_image", title: finalTitle, description: finalDescription, images: [image] },
    ...(seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
