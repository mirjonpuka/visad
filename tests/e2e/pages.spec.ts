import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Phase 7 acceptance: every inner page renders one h1, no horizontal scroll on
// phones, no serious a11y issues; filters live in the URL; the language
// switcher maps document slugs.

async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
  // Pages with a Turnstile widget never go fully idle
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
}

const PAGES = [
  "/sistemet",
  "/sistemet/dritare",
  "/projektet",
  "/projektet/fishta-hotel",
  "/fabrika",
  "/zgjidhje/hotele-turizem",
  "/karriera",
  "/privatesia",
  "/kontakt",
  "/en/contact",
  "/en/systems/windows",
  "/en/projects/residential-complex",
];

for (const path of PAGES) {
  test(`${path}: one h1, no overflow at 390, no serious a11y issues`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, path);
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    await page.setViewportSize({ width: 1440, height: 900 });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });
}

test("projects: filters go to the URL, Back undoes them", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/projektet");
  const tiles = page.locator("main ul li a[href*='/projektet/']");
  const all = await tiles.count();
  const villa = page.getByRole("button", { name: "Vila", exact: true });
  await expect(async () => {
    await villa.click();
    await expect(page).toHaveURL(/lloji=villa/, { timeout: 1000 });
  }).toPass();
  await expect(villa).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => tiles.count()).toBeLessThan(all);
  await page.goBack();
  await expect(page).not.toHaveURL(/lloji=/);
  await expect.poll(() => tiles.count()).toBe(all);
});

test("projects: a filtered URL opens filtered", async ({ page }) => {
  await open(page, "/projektet?lloji=hotel");
  await expect(page.getByRole("button", { name: "Hotel", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("main ul li a[href*='/projektet/']")).toHaveCount(1);
});

test("language switcher uses the document's slug in each language", async ({ page }) => {
  await open(page, "/projektet/kompleks-banimi");
  await expect(page.locator('header a[hreflang="en"]').first()).toHaveAttribute("href", "/en/projects/residential-complex");
});

test("a slug from another language redirects to this language's URL", async ({ page }) => {
  await open(page, "/en/systems/ballkone-parmake");
  await expect(page).toHaveURL(/\/en\/systems\/balconies-railings$/);
});

test("factory has the certificates anchor the ALUMIL band links to", async ({ page }) => {
  await open(page, "/fabrika");
  await expect(page.locator("#certifikata")).toBeVisible();
});

test("factory process: pinned horizontal on laptop, vertical list on phone", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/fabrika");
  await expect(page.locator(".pin-spacer")).toHaveCount(1);
  const track = page.locator(".pin-spacer ol");
  const before = await track.evaluate((el) => el.getBoundingClientRect().x);
  const top = await page.locator(".pin-spacer").evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y + 1200), top);
  await expect.poll(() => track.evaluate((el) => el.getBoundingClientRect().x)).toBeLessThan(before - 200);

  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/fabrika");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});

test("lightbox: opens from the gallery, arrows move, Esc closes and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/dev/kit");
  const thumb = page.locator("#gallery button[aria-label^='Foto 2 ']");
  await thumb.scrollIntoViewIfNeeded();
  await expect(async () => {
    await thumb.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 1000 });
  }).toPass();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("2 / 6");
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText("3 / 6");
  await dialog.getByRole("button", { name: "Foto e mëparshme" }).click();
  await expect(dialog).toContainText("2 / 6");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(thumb).toBeFocused();
});

test("unknown URL shows the 404 page", async ({ page }) => {
  const response = await page.goto("/nuk-ekziston");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(/nuk u gjet/);
});
