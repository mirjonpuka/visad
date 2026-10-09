/**
 * Owner brief D2: the careers hero becomes the Visad truck photo, wide 16:10
 * crop. The alt texts (sq/en/it/de) are taken from the same photo on Home.
 * Usage: npx tsx --env-file=.env.local scripts/migrations/005-careers-hero.mts
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const truck = await client.fetch<{ alt?: unknown[] } | null>(`*[_id == "homePage"][0].factoryImages[_key == "f2"][0]{ alt }`);
if (!truck?.alt?.length) throw new Error("Truck photo alt not found on homePage.factoryImages[f2]");

const path = join(process.cwd(), "public/images/crops/visad-truck-aluminium-frames-wide-16x10.webp");
const asset = await client.assets.upload("image", createReadStream(path), { filename: basename(path) });

const careersHero = {
  _type: "imageWithAlt",
  asset: { _type: "reference", _ref: asset._id },
  alt: truck.alt,
  isPlaceholder: false,
};
const result = await client.patch("pageSettings").set({ careersHero }).commit({ visibility: "async" });
console.log("careers hero → truck 16:10 crop", asset._id, "· rev", result._rev);
