import "server-only";
import { client } from "@/sanity/lib/client";
import { SLUGS_BY_TYPE_QUERY } from "@/sanity/lib/queries";
import type { Slugs } from "@/sanity/lib/types";

/** Value used when a type has no documents yet (Cache Components needs ≥ 1 param). */
export const PLACEHOLDER_SLUG = "__placeholder__";

/** The slug a locale uses: its own, else en, else sq (same fallback as the queries). */
export function slugFor(slugs: Slugs, locale: string): string | undefined {
  const pick = (l: string) => slugs?.find((s) => s.language === l)?.slug;
  return pick(locale) ?? pick("en") ?? pick("sq");
}

/**
 * generateStaticParams for `[slug]` / `[segment]` routes: every document of
 * `type` with its slug in the current locale. Documents published later are
 * rendered on first request (dynamicParams) behind the route's loading.tsx.
 */
export async function localizedSlugParams<K extends string>(
  type: string,
  locale: string,
  key: K,
): Promise<Record<K, string>[]> {
  const docs = await client.fetch<{ slugs: Slugs }[]>(SLUGS_BY_TYPE_QUERY, { type });
  const values = [...new Set(docs.map((d) => slugFor(d.slugs, locale)).filter(Boolean))] as string[];
  const list = values.length ? values : [PLACEHOLDER_SLUG];
  return list.map((value) => ({ [key]: value }) as Record<K, string>);
}

/** Map of locale → slug for the language switcher and hreflang. */
export function slugMap(slugs: Slugs, locales: readonly string[]) {
  return Object.fromEntries(locales.map((l) => [l, slugFor(slugs, l)]).filter(([, s]) => s)) as Record<
    string,
    string
  >;
}
