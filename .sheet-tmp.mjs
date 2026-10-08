import sharp from "sharp";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [dir, out, ...ids] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
for (const id of ids) {
  const res = await fetch(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`);
  if (res.ok) writeFileSync(join(dir, `${id}.jpg`), Buffer.from(await res.arrayBuffer()));
  else console.log(id, "failed", res.status);
}
const files = readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
const W = 360, H = 240, cols = 4, label = 22, rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(
  files.map(async (f, i) => {
    const img = await sharp(join(dir, f)).resize(W, H, { fit: "cover" }).toBuffer();
    const svg = Buffer.from(
      `<svg width="${W}" height="${label}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="16" font-family="monospace" font-size="14" fill="#fff">${f}</text></svg>`,
    );
    const x = (i % cols) * W, y = Math.floor(i / cols) * (H + label);
    return [{ input: svg, left: x, top: y }, { input: img, left: x, top: y + label }];
  }),
);
await sharp({ create: { width: cols * W, height: rows * (H + label), channels: 3, background: "#111" } })
  .composite(tiles.flat())
  .jpeg({ quality: 80 })
  .toFile(out);
console.log(out);
