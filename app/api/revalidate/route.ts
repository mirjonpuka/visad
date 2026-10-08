import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity webhook → on-demand revalidation (Architecture §4).
 *
 * Webhook settings (sanity.io/manage → API → Webhooks):
 *   URL: https://visad.al/api/revalidate   Dataset: production   Trigger: create, update, delete
 *   Projection: {_type, "slugs": slug[].value.current}
 *   Secret: SANITY_REVALIDATE_SECRET
 */

// Singletons use short tag names
const TYPE_TAG: Record<string, string> = {
  siteSettings: "settings",
  homePage: "home",
  factoryPage: "factory",
};

type Body = { _type?: string; slugs?: (string | null)[] | null };

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });

  try {
    const { isValidSignature, body } = await parseBody<Body>(request, secret, true);
    if (!isValidSignature) return Response.json({ error: "Invalid signature" }, { status: 401 });
    if (!body?._type) return Response.json({ error: "Missing _type" }, { status: 400 });

    const typeTag = TYPE_TAG[body._type] ?? body._type;
    const tags = [typeTag, ...(body.slugs ?? []).filter(Boolean).map((slug) => `${typeTag}:${slug}`)];
    // Expire immediately so editors see the change on the next request
    for (const tag of tags) revalidateTag(tag, { expire: 0 });

    return Response.json({ revalidated: tags, now: Date.now() });
  } catch (error) {
    console.error("[revalidate]", error);
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
