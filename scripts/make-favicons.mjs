/**
 * Favicon set from the full VISAD wordmark, as large as fits (92% of the width).
 * Browser tab (owner: no background):
 *   app/icon.svg — transparent; dark letters on light tab bars, white on dark ones
 *   app/favicon.ico (16, 32, 48) — transparent, dark letters (browsers without SVG icons)
 * Home screen / web manifest keep the ink-900 square (iOS fills transparency with black):
 *   app/apple-icon.png (180) · public/brand/logo/png/icon-192.png · icon-512.png
 * Usage: node scripts/make-favicons.mjs [previewDir]
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const BG = "#0E0F11";
const onDark = readFileSync("public/brand/logo/visad-wordmark-on-dark.svg");
const onLight = readFileSync("public/brand/logo/visad-wordmark-on-light.svg", "utf8");

async function square(size, { svg = onDark, background = BG, fill = 0.92 } = {}) {
  const w = Math.round(size * fill);
  const mark = await sharp(svg, { density: Math.max(72, Math.ceil((w / 1280) * 72 * 8)) })
    .resize({ width: w })
    .png()
    .toBuffer();
  const meta = await sharp(mark).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([
      { input: mark, left: Math.round((size - meta.width) / 2), top: Math.round((size - meta.height) / 2) },
    ])
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
for (const s of [180, 192, 512]) sizes[s] = await square(s);
const tab = {};
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
for (const s of [16, 32, 48]) tab[s] = await square(s, { svg: Buffer.from(onLight), background: clear });

// SVG tab icon: square viewBox around the 1280×500 wordmark, letters follow the browser theme
const tabSvg = onLight
  .replace(/ role="img" aria-label="[^"]*"/, "")
  .replace(/<title>.*?<\/title>/, "")
  .replace('viewBox="0 0 1280 500"', 'viewBox="0 -390 1280 1280"')
  .replace(/fill="#111214"/g, 'class="l"')
  .replace(
    "<defs>",
    "<style>.l{fill:#111214}@media (prefers-color-scheme:dark){.l{fill:#fff}}</style><defs>",
  );
writeFileSync("app/icon.svg", tabSvg);
writeFileSync("app/favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: tab[size] }))));
if (existsSync("app/icon.png")) rmSync("app/icon.png");
writeFileSync("app/apple-icon.png", sizes[180]);
writeFileSync("public/brand/logo/png/icon-192.png", sizes[192]);
writeFileSync("public/brand/logo/png/icon-512.png", sizes[512]);
console.log("favicons written");

// Preview: the 32px icon shown at 1:1 and enlarged 8× (pixelated) for judging
const previewDir = process.argv[2];
if (previewDir) {
  // Light and dark tab bars, the transparent 32px icon at 1:1 and enlarged 8×
  const darkSvg = Buffer.from(onLight.replace(/#111214/g, "#FFFFFF"));
  const dark32 = await square(32, { svg: darkSvg, background: clear });
  const parts = [];
  for (const [bg, icon, top] of [
    ["#f1f3f4", tab[32], 0],
    ["#202124", dark32, 280],
  ]) {
    const big = await sharp(icon).resize(256, 256, { kernel: "nearest" }).toBuffer();
    parts.push(
      {
        input: await sharp({ create: { width: 320, height: 280, channels: 4, background: bg } })
          .png()
          .toBuffer(),
        left: 0,
        top,
      },
      { input: icon, left: 8, top: top + 8 },
      { input: big, left: 56, top: top + 12 },
    );
  }
  await sharp({ create: { width: 320, height: 560, channels: 4, background: "#ffffff" } })
    .composite(parts)
    .png()
    .toFile(`${previewDir}/favicon-preview.png`);
  console.log("preview written");
}
