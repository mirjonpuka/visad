/**
 * Exports the still of the 3D window (poster + phone version): opens
 * /dev/profile-render on the running dev server, reads the 1600×2000 canvas
 * and writes public/brand/3d/window.webp with a transparent background, so it
 * matches any section colour. Usage: npm run dev, then npm run profile:render
 */
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = "public/brand/3d";

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });
await page.addInitScript(() => localStorage.setItem("visad-intro-seen", "1"));
await page.goto(`${base}/dev/profile-render`, { waitUntil: "load" });
await page.locator("[data-ready]").waitFor({ timeout: 90_000 });
await page.waitForTimeout(3000);

const dataUrl = await page.evaluate(() => document.querySelector("[data-ready] canvas").toDataURL("image/png"));
await browser.close();

const png = Buffer.from(dataUrl.split(",")[1], "base64");
const meta = await sharp(png).metadata();
console.log(`canvas ${meta.width}×${meta.height}`);

mkdirSync(out, { recursive: true });
// Trim the empty margin, keep the alpha channel
await sharp(png).trim().webp({ quality: 85, alphaQuality: 90 }).toFile(`${out}/window.webp`);
const info = await sharp(`${out}/window.webp`).metadata();
console.log(`saved ${out}/window.webp ${info.width}×${info.height}`);
