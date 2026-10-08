// Downloads the temporary stock photos (Pexels License: free commercial use,
// no attribution required) and converts them to WebP like the handoff images.
// Run: node scripts/import-stock.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const list = JSON.parse(readFileSync(join(root, "scripts/stock-photos.json"), "utf8"));
const outDir = join(root, "public/images/stock");
mkdirSync(outDir, { recursive: true });

const WIDTHS = [640, 960, 1600, 2400];
const manifest = {};

for (const photo of list) {
  const url = `https://images.pexels.com/photos/${photo.pexelsId}/pexels-photo-${photo.pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=2400`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${photo.id}: HTTP ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(input).metadata();

  const web = [];
  for (const width of WIDTHS.filter((w) => w < meta.width).concat(meta.width)) {
    const file = `${photo.id}-${width}.webp`;
    const info = await sharp(input).resize({ width }).webp({ quality: 80 }).toFile(join(outDir, file));
    web.push({ src: `/images/stock/${file}`, width: info.width, height: info.height });
  }
  const blur = await sharp(input).resize(24, 24, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

  manifest[photo.id] = {
    id: photo.id,
    alt: photo.alt,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    isPlaceholder: true,
    placeholderNote: `Temporary photo · will be replaced with ${photo.replaceWith}`,
    slot: photo.slot,
    credit: `Pexels License · https://www.pexels.com/photo/${photo.pexelsId}/`,
    web,
  };
  console.log(`${photo.id}: ${web.map((w) => w.width).join("/")}`);
}

writeFileSync(join(root, "lib/stock.manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Imported ${list.length} stock photos.`);
