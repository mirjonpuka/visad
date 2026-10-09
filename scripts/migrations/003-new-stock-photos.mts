/**
 * Owner feedback (after Phase 10): real Visad photos only on projects and
 * company slots (factory, truck, installation). Home hero becomes a slideshow
 * of new temporary photos; systems that used project photos get stock ones.
 * Usage: npx tsx --env-file=.env.local scripts/migrations/003-new-stock-photos.mts
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

type Entry = { alt: Record<string, string>; placeholderNote: string; credit: string; web: { src: string; width: number }[] };
const manifest = JSON.parse(readFileSync(join(process.cwd(), "lib/stock.manifest.json"), "utf8")) as Record<string, Entry>;

const ALT_IT_DE: Record<string, { it: string; de: string }> = {
  "stock-hero-1": { it: "Villa moderna al tramonto con grandi finestre illuminate", de: "Moderne Villa in der Abenddämmerung mit großen beleuchteten Fenstern" },
  "stock-hero-2": { it: "Soggiorno che si apre con una parete vetrata su una terrazza vista mare", de: "Wohnzimmer, das sich über eine Glaswand zur Terrasse mit Meerblick öffnet" },
  "stock-hero-3": { it: "Facciate in vetro e alluminio che riflettono il cielo", de: "Glas-Aluminium-Fassaden, die den Himmel spiegeln" },
  "stock-hero-4": { it: "Casa moderna con grandi finestre e porte vetrate", de: "Modernes Haus mit großen Glasfenstern und -türen" },
  "stock-system-windows": { it: "Finestre in alluminio aperte su una facciata", de: "Geöffnete Aluminiumfenster an einer Fassade" },
  "stock-system-railings": { it: "Balconi con parapetti in vetro su un edificio residenziale", de: "Balkone mit Glasgeländern an einem Wohngebäude" },
  "stock-system-shutters": { it: "Persiane in alluminio su una facciata", de: "Aluminium-Fensterläden an einer Fassade" },
};

async function image(id: string, key?: string) {
  const entry = manifest[id];
  if (!entry) throw new Error(`Unknown stock image ${id}`);
  const largest = entry.web.reduce((a, b) => (b.width > a.width ? b : a));
  const path = join(process.cwd(), "public", largest.src);
  const asset = await client.assets.upload("image", createReadStream(path), { filename: basename(path) });
  const extra = ALT_IT_DE[id];
  return {
    _type: "imageWithAlt",
    ...(key ? { _key: key } : {}),
    asset: { _type: "reference", _ref: asset._id },
    alt: [
      { _key: "sq", _type: "internationalizedArrayStringValue", language: "sq", value: entry.alt.sq },
      { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: entry.alt.en },
      ...(extra
        ? [
            { _key: "it", _type: "internationalizedArrayStringValue", language: "it", value: extra.it },
            { _key: "de", _type: "internationalizedArrayStringValue", language: "de", value: extra.de },
          ]
        : []),
    ],
    isPlaceholder: true,
    placeholderNote: entry.placeholderNote,
    credit: entry.credit,
  };
}

const heroImages = await Promise.all(["stock-hero-1", "stock-hero-2", "stock-hero-3", "stock-hero-4"].map((id, i) => image(id, `h${i + 1}`)));
const windows = await image("stock-system-windows");
const railings = await image("stock-system-railings");
const shutters = await image("stock-system-shutters");

const tx = client.transaction();
tx.patch("homePage", (p) => p.set({ heroImages, heroImage: heroImages[0] }));
tx.patch("system-dritare", (p) => p.set({ thumbnail: windows, accordionImage: windows, heroImage: windows }));
tx.patch("system-ballkone-parmake", (p) => p.set({ thumbnail: railings, accordionImage: railings, heroImage: railings }));
tx.patch("system-grila", (p) => p.set({ heroImage: shutters }));
const result = await tx.commit({ visibility: "async" });
console.log("updated home hero (4 photos), windows, railings, shutters · tx", result.transactionId);
