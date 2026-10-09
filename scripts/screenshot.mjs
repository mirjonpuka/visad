// Screenshots at the four review widths (dev server must be running).
// Usage: node scripts/screenshot.mjs [path] [outDir] [--sections] [--widths=1440,390]
// --sections: one image per <section id>, instead of one full page.
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const [path = "/dev/kit", outDir = ".screenshots"] = args.filter((a) => !a.startsWith("--"));
const base = process.env.BASE_URL ?? "http://localhost:3000";
const widthsFlag = flags.find((f) => f.startsWith("--widths="));
const widths = widthsFlag ? widthsFlag.slice(9).split(",").map(Number) : [1440, 1024, 768, 390];
const bySection = flags.includes("--sections");
const slug = path.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "home";

const browser = await chromium.launch();
const errors = [];
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  // Returning visitor: no first-visit intro over the screenshots
  await page.addInitScript(() => localStorage.setItem("visad-intro-off", "1"));
  page.on("console", (m) => m.type() === "error" && errors.push(`[${width}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${width}] ${e.message}`));
  // "load" + settle: pages with Turnstile never reach "networkidle"
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  // Scroll through so lazy images load, then return to top
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  await page.waitForTimeout(700);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) console.log(`⚠ ${width}px: horizontal overflow ${overflow}px`);

  if (bySection) {
    // Top-level sections of <main> (falls back to section[id] for pages like the kit)
    const selector = (await page.locator("main > section").count()) > 1 ? "main > section" : "section[id]";
    const sections = page.locator(selector);
    for (let i = 0; i < (await sections.count()); i++) {
      const section = sections.nth(i);
      const name = (await section.getAttribute("id")) ?? `s${i + 1}`;
      await section.screenshot({
        path: `${outDir}/${slug}-${width}-${String(i + 1).padStart(2, "0")}-${name}.png`,
      });
    }
  } else {
    await page.screenshot({ path: `${outDir}/${slug}-${width}.png`, fullPage: true });
  }
  console.log(`${width}px done`);
  await page.close();
}
await browser.close();
if (errors.length) console.log("Console errors:\n" + errors.join("\n"));
