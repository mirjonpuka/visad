import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";
import { slugFor } from "@/lib/static-params";
import { client } from "@/sanity/lib/client";
import type { Slugs } from "@/sanity/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";

const STATIC: AppPathname[] = ["/", "/sistemet", "/projektet", "/fabrika", "/karriera", "/kontakt", "/privatesia"];

type Doc = { slugs: Slugs; updated: string };

async function documents() {
  "use cache";
  cacheTag("sanity", "system", "project", "solution", "job");
  cacheLife("hours");
  return client.fetch<{ systems: Doc[]; projects: Doc[]; solutions: Doc[]; jobs: Doc[] }>(`{
    "systems": *[_type == "system" && defined(slug)]{ "slugs": slug[]{ language, "slug": value.current }, "updated": _updatedAt },
    "projects": *[_type == "project" && defined(slug)]{ "slugs": slug[]{ language, "slug": value.current }, "updated": _updatedAt },
    "solutions": *[_type == "solution" && defined(slug)]{ "slugs": slug[]{ language, "slug": value.current }, "updated": _updatedAt },
    "jobs": *[_type == "job" && active != false && defined(slug)]{ "slugs": slug[]{ language, "slug": value.current }, "updated": _updatedAt }
  }`);
}

function url(pathname: AppPathname, locale: Locale, params?: Record<string, string>) {
  const href = (params ? { pathname, params } : pathname) as Parameters<typeof getPathname>[0]["href"];
  return SITE_URL + getPathname({ href, locale });
}

/** One entry per page and locale, each with its hreflang alternates (Architecture §8). */
function entries(pathname: AppPathname, param?: { key: string; slugs: Slugs }, lastModified?: string) {
  const forLocale = (l: Locale) => {
    if (!param) return url(pathname, l);
    const slug = slugFor(param.slugs, l);
    return slug ? url(pathname, l, { [param.key]: slug }) : null;
  };
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, forLocale(l)]).filter(([, href]) => href),
  ) as Record<string, string>;
  return routing.locales
    .filter((l) => languages[l])
    .map((l) => ({
      url: languages[l],
      lastModified: lastModified ? new Date(lastModified) : undefined,
      alternates: { languages: { ...languages, "x-default": languages.sq } },
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await documents();
  return [
    ...STATIC.flatMap((p) => entries(p)),
    ...docs.systems.flatMap((d) => entries("/sistemet/[slug]", { key: "slug", slugs: d.slugs }, d.updated)),
    ...docs.projects.flatMap((d) => entries("/projektet/[slug]", { key: "slug", slugs: d.slugs }, d.updated)),
    ...docs.solutions.flatMap((d) => entries("/zgjidhje/[segment]", { key: "segment", slugs: d.slugs }, d.updated)),
    ...docs.jobs.flatMap((d) => entries("/karriera/[slug]", { key: "slug", slugs: d.slugs }, d.updated)),
  ];
}
