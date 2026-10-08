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

  await rows.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(rows.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#sistemet").getByText(/02 \/ 06 ·/)).toBeVisible();
});

test("english home uses English CMS content", async ({ page }) => {
  await open(page, "/en");
  await expect(page.locator("h1")).toContainText("Precision");
  await expect(page.locator("#sistemet")).toContainText("A system for every opening.");
});
