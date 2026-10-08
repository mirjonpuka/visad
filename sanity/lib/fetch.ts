import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { locale as rootLocale } from "next/root-params";
import type { QueryParams } from "next-sanity";
import { client } from "./client";
import { previewClient } from "./server";

/**
 * Every Sanity read goes through here (Architecture §4).
 *
 * - `$locale` is added automatically from the `[locale]` root param. Reading it
 *   inside the cache scope (not passing it in) keeps the result part of the
 *   prerendered shell; Next.js tracks the root param in the cache key.
 * - Published content is cached with the given tags (`project`, `project:<slug>`,
 *   `settings`, …) and revalidated on demand by the Sanity webhook
 *   (/api/revalidate). Time-based fallback: 1 hour.
 * - In Draft Mode (Presentation tool) Next.js bypasses the cache and we read
 *   drafts with the server token and stega for click-to-edit overlays.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: QueryParams;
  tags: string[];
}): Promise<T> {
  "use cache";
  cacheTag("sanity", ...tags);
  // Locally the Sanity webhook cannot reach localhost: revalidate after 5s so a
  // publish in the Studio shows up after a reload or two. (The "seconds"
  // profile would make the data a dynamic hole outside the prerendered shell.)
  if (process.env.NODE_ENV === "development") cacheLife({ stale: 30, revalidate: 5, expire: 300 });
  else cacheLife("hours");

  const queryParams = { locale: (await rootLocale()) ?? "sq", ...params };
  const { isEnabled: isDraft } = await draftMode();
  if (isDraft) {
    return previewClient.fetch<T>(query, queryParams, { stega: true });
  }
  return client.fetch<T>(query, queryParams, { stega: false });
}
