/**
 * Exports the static 3D render (3D spec §Generating the static render):
 * opens /dev/profile-render on the running dev server, reads the 2400×1600
 * canvas and writes public/brand/3d/profile-exploded.webp (+ -1200 version),
 * WebP quality 82. Usage: npm run dev, then npm run profile:render
 */
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "public/brand/3d";

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await page.addInitScript(() => localStorage.setItem("visad-intro-seen", "1"));
await page.goto(`${base}/dev/profile-render`, { waitUntil: "networkidle" });
await page.locator("[data-ready]").waitFor({ timeout: 60_000 });
await page.waitForTimeout(2500);

const dataUrl = await page.evaluate(() => document.querySelector("[data-ready] canvas").toDataURL("image/png"));
await browser.close();

const png = Buffer.from(dataUrl.split(",")[1], "base64");
const meta = await sharp(png).metadata();
console.log(`canvas ${meta.width}×${meta.height}`);

mkdirSync(out, { recursive: true });
// Flatten onto ink-900 (#0E0F11) so the image matches the section background
const flat = sharp(png).flatten({ background: "#0E0F11" });
await flat.clone().resize(2400, 1600, { fit: "cover" }).webp({ quality: 82 }).toFile(`${out}/profile-exploded.webp`);
await flat.clone().resize(1200, 800, { fit: "cover" }).webp({ quality: 82 }).toFile(`${out}/profile-exploded-1200.webp`);
console.log(`saved ${out}/profile-exploded.webp + -1200.webp`);
