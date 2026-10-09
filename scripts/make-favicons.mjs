/**
 * Favicon set from the full VISAD wordmark on an ink-900 square (owner
 * request B1): as large as fits (wordmark width = 92% of the square).
 *   app/favicon.ico (16, 32, 48) · app/icon.png (32) · app/apple-icon.png (180)
 *   public/brand/logo/png/icon-192.png · icon-512.png (web manifest)
 * Usage: node scripts/make-favicons.mjs [previewDir]
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const BG = "#0E0F11";
const svg = readFileSync("public/brand/logo/visad-wordmark-on-dark.svg");

async function square(size, fill = 0.92) {
  const w = Math.round(size * fill);
  const mark = await sharp(svg, { density: Math.max(72, Math.ceil((w / 1280) * 72 * 8)) })
    .resize({ width: w })
    .png()
    .toBuffer();
  const meta = await sharp(mark).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toBuffer();
}

/** ICO with PNG payloads (supported by every current browser) */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const sizes = {};
for (const s of [16, 32, 48, 180, 192, 512]) sizes[s] = await square(s);

writeFileSync("app/favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: sizes[size] }))));
writeFileSync("app/icon.png", sizes[32]);
writeFileSync("app/apple-icon.png", sizes[180]);
writeFileSync("public/brand/logo/png/icon-192.png", sizes[192]);
writeFileSync("public/brand/logo/png/icon-512.png", sizes[512]);
console.log("favicons written");

// Preview: the 32px icon shown at 1:1 and enlarged 8× (pixelated) for judging
const previewDir = process.argv[2];
if (previewDir) {
  const big = await sharp(sizes[32]).resize(256, 256, { kernel: "nearest" }).toBuffer();
  await sharp({ create: { width: 320, height: 280, channels: 4, background: "#ffffff" } })
    .composite([
      { input: sizes[32], left: 8, top: 8 },
      { input: sizes[16], left: 48, top: 16 },
      { input: big, left: 56, top: 12 },
    ])
    .png()
    .toFile(`${previewDir}/favicon-preview.png`);
  console.log("preview written");
}
