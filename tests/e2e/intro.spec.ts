import { expect, test } from "@playwright/test";

// Phase 5: the logo intro plays on the first visit only and can be skipped.

test.describe("first visit", () => {
  test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1440, height: 900 } });

  test("intro plays once, a key press skips it, the hero comes in", async ({ page }) => {
    // The intro lasts ~2.85s: check it right away, not after "networkidle"
    await page.goto("/", { waitUntil: "commit" });
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-intro", /play|skip|done/);
    await page.waitForLoadState("load");
    await page.keyboard.press("Space");
    await expect(html).toHaveAttribute("data-hero-in", /.*/);
    await expect(page.locator(".intro")).toBeHidden();

    // Remembered: no intro on the next visit
    await page.reload({ waitUntil: "networkidle" });
    await expect(html).not.toHaveAttribute("data-intro", /play|skip/);
  });
});

test.describe("reduced motion", () => {
  test.use({ storageState: { cookies: [], origins: [] }, reducedMotion: "reduce" });

  test("no intro and nothing hidden", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("html")).not.toHaveClass(/js-motion/);
    await expect(page.locator("h1")).toBeVisible();
  });
});
