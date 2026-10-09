import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Phase 4 acceptance: Home sections 3.1–3.8 render from the CMS, layout holds
// at 1440/1024/768/390, no serious accessibility issues (UI §15).

async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
}

for (const width of [1440, 1024, 768, 390]) {
  test(`home at ${width}px: sections, one h1, no overflow, no serious a11y issues`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "/");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Precizion");
    for (const id of ["sistemet", "projektet", "fabrika", "zgjidhje", "kontakt"]) {
      await expect(page.locator(`section#${id}`)).toBeAttached();
    }
    await expect(page.locator("#projektet li a")).toHaveCount(5);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      serious.map(
        (v) =>
          `${v.id}: ${v.nodes
            .map((n) => n.target.join(" "))
            .slice(0, 3)
            .join(" | ")}`,
      ),
    ).toEqual([]);
  });
}

test("systems accordion: one row open, keyboard moves between rows, image label follows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/");
  const rows = page.locator("#sistemet button[aria-expanded]");
  await expect(rows).toHaveCount(6);
  await expect(rows.nth(0)).toHaveAttribute("aria-expanded", "true");

  // Retried: the page section may hydrate after "networkidle" on the dev server
  await expect(async () => {
    await rows.nth(0).focus();
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(1)).toBeFocused({ timeout: 1000 });
  }).toPass();
  await page.keyboard.press("Enter");
  await expect(rows.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#sistemet").getByText(/02 \/ 06 ·/)).toBeVisible();
});

test("3D profile: pinned WebGL scene on laptop, steps follow the scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/");
  const section = page.locator("#sistemet");
  await expect(section.locator(".pin-spacer")).toHaveCount(1);
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), top + 100);
  await expect(section.locator("canvas")).toHaveCount(1);
  await page.evaluate((y) => window.scrollTo(0, y), top + 900 * 2.8);
  await expect(section.locator('[aria-current="step"] h3')).toHaveText(/I montuar/);
  // Scrolling back up plays it in reverse (it must not run only once)
  await page.evaluate((y) => window.scrollTo(0, y), top + 900 * 0.3);
  await expect(section.locator('[aria-current="step"] h3')).toHaveText(/Profili/);
  await expect(section.locator("canvas")).toHaveCount(1);
});

test("3D profile: phone gets the static render and a plain list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/");
  const section = page.locator("#sistemet");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('img[src*="window"]')).toHaveCount(1);
  await expect(section.locator("canvas")).toHaveCount(0);
  await expect(section.locator(".pin-spacer")).toHaveCount(0);
});

test("english home uses English CMS content", async ({ page }) => {
  await open(page, "/en");
  await expect(page.locator("h1")).toContainText("Precision");
  await expect(page.locator("#sistemet")).toContainText("A system for every opening.");
});
