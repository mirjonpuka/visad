// Copies the assets the site needs out of _handoff (read-only) into the project.
// Run: node scripts/sync-handoff-assets.mjs
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const handoff = join(root, "_handoff");

// Logo SVGs + PNG icons
cpSync(join(handoff, "brand/logo"), join(root, "public/brand/logo"), { recursive: true });

// Fix: the handoff wordmark's viewBox (height 420) cuts off the swoosh's bottom
// tail, which sits at y 420–500. Use the full logo's 500 height (DECISIONS D1.36).
for (const tone of ["on-dark", "on-light"]) {
  const file = join(root, `public/brand/logo/visad-wordmark-${tone}.svg`);
  const svg = readFileSync(file, "utf8");
  if (!svg.includes('viewBox="0 0 1280 420"')) throw new Error(`Unexpected wordmark viewBox in ${file}`);
  writeFileSync(file, svg.replace('viewBox="0 0 1280 420"', 'viewBox="0 0 1280 500"'));
}

// App icons come from `npm run favicons` (owner: wordmark, transparent tab icon), not from _handoff

// WebP images only (never JPG/PNG to the browser)
for (const dir of ["web", "crops"]) {
  const out = join(root, "public/images", dir);
  mkdirSync(out, { recursive: true });
  for (const file of readdirSync(join(handoff, "images", dir))) {
    if (file.endsWith(".webp")) cpSync(join(handoff, "images", dir, file), join(out, file));
  }
}

// Image manifest → typed data the temporary CMSImage can read
const manifest = JSON.parse(readFileSync(join(handoff, "images/manifest.json"), "utf8"));
const images = Object.fromEntries(
  manifest.map((m) => [
    m.id,
    {
      id: m.id,
      alt: m.alt,
      blurDataURL: m.blurDataURL,
      realVisadPhoto: m.realVisadPhoto,
      isPlaceholder: m.isPlaceholder,
      slots: m.slots,
      web: m.web.map((w) => ({ src: "/images/" + w.path, width: w.width, height: w.height })),
      crops: Object.fromEntries(
        Object.entries(m.crops ?? {}).map(([k, c]) => [
          k,
          { src: "/images/" + c.path, width: c.width, height: c.height },
        ]),
      ),
    },
  ]),
);
writeFileSync(join(root, "lib/images.manifest.json"), JSON.stringify(images, null, 2) + "\n");

console.log(`Synced logo, icons and ${manifest.length} images.`);
