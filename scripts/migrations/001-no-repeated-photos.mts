/**
 * Migration 001 (Phase 4): no photo appears twice on the Home page.
 * Audience cards and two system thumbnails switch to temporary stock photos
 * (owner: "you don't have to repeat the pictures"; DECISIONS D4.2).
 *
 *   npx tsx --env-file=.env.local scripts/migrations/001-no-repeated-photos.mts
 *
 * Only the listed image fields are replaced; nothing else is touched.
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-02-19",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

type Stock = {
  alt: Record<string, string>;
  placeholderNote: string;
  credit: string;
  web: { src: string; width: number }[];
};
const stock = JSON.parse(readFileSync(join(process.cwd(), "lib/stock.manifest.json"), "utf8")) as Record<
  string,
  Stock
>;

async function stockImage(id: string) {
  const entry = stock[id];
  const largest = entry.web.reduce((a, b) => (b.width > a.width ? b : a));
  const path = join(process.cwd(), "public", largest.src);
  const asset = await client.assets.upload("image", createReadStream(path), { filename: basename(path) });
  return {
    _type: "imageWithAlt",
    asset: { _type: "reference", _ref: asset._id },
    alt: Object.entries(entry.alt).map(([language, value]) => ({
      _key: language,
      _type: "internationalizedArrayStringValue",
      language,
      value,
    })),
    isPlaceholder: true,
    placeholderNote: entry.placeholderNote,
    credit: entry.credit,
  };
}

const changes: [docId: string, fields: string[], stockId: string][] = [
  ["system-sisteme-rreshqitese", ["thumbnail", "accordionImage"], "stock-system-sliding"],
  ["system-grila", ["thumbnail", "accordionImage"], "stock-system-shutters"],
  ["solution-homeowners", ["heroImage"], "stock-solution-homeowners"],
  ["solution-developers", ["heroImage"], "stock-solution-developers"],
  ["solution-hotels", ["heroImage"], "stock-solution-hotels"],
];

const tx = client.transaction();
for (const [docId, fields, stockId] of changes) {
  const image = await stockImage(stockId);
  tx.patch(docId, (p) => p.set(Object.fromEntries(fields.map((f) => [f, image]))));
  console.log(`${docId}: ${fields.join(", ")} → ${stockId}`);
}
const result = await tx.commit();
console.log(`Done · tx ${result.transactionId}`);
