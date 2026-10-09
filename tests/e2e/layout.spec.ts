import { expect, test, type Page } from "@playwright/test";

// Phase 2 acceptance (00 · Phase 2, UI §2): keyboard navigation through all
// menus, Esc closes them, focus trapped in the mobile menu, language switcher
// keeps the current page, no horizontal scroll.

/** Navigate and wait until the dev server has compiled and React has hydrated. */
async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
}

async function activeInfo(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return {
      text: el?.textContent?.trim() ?? "",
      inHeader: !!el?.closest("header"),
      inMobileMenu: !!el?.closest("#mobile-menu"),
      inSystemsPanel: !!el?.closest("#mega-systems"),
      expanded: el?.getAttribute("aria-expanded"),
    };
  });
}

test.describe("laptop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("skip link is the first focusable element", async ({ page }) => {
    await open(page, "/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Kalo te përmbajtja");
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("mega-menu opens with keyboard, traps focus, closes with Esc", async ({ page }) => {
    await open(page, "/");
    const trigger = page.getByRole("button", { name: "Sistemet" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mega-systems")).toBeVisible();

    // 1 trigger + 1 "all systems" link + 6 items = 8 stops; tab well past that
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      const info = await activeInfo(page);
      expect(info.inSystemsPanel || info.text.startsWith("Sistemet")).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await expect(page.locator("#mega-systems")).toBeHidden();
  });

  test("mega-menu opens on hover and closes on mouse leave", async ({ page }) => {
    await open(page, "/");
    const trigger = page.getByRole("button", { name: "Zgjidhje" });
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(700, 850);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("click outside closes the mega-menu", async ({ page }) => {
    await open(page, "/");
    const trigger = page.getByRole("button", { name: "Sistemet" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(700, 880);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("navbar hides on scroll down and returns on scroll up", async ({ page }) => {
    await open(page, "/");
    const headerY = () => page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().y);
    await page.mouse.move(700, 500);
    // Retried: on the dev server Lenis / the scroll listener may attach late
    await expect(async () => {
      await page.mouse.wheel(0, 400);
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(400);
      // Sub-pixel tolerance: Lenis + the 400ms translate settle around -76
      await expect.poll(headerY, { timeout: 1500 }).toBeLessThan(-70);
    }).toPass();
    // Retried as well: one small wheel step can land between scroll events
    await expect(async () => {
      await page.mouse.wheel(0, -300);
      await expect.poll(headerY, { timeout: 1500 }).toBeGreaterThan(-1);
    }).toPass();
  });

  test("language switcher keeps the current page", async ({ page }) => {
    await open(page, "/dev/kit");
    await page.locator("header").getByRole("link", { name: "EN · English" }).click();
    await expect(page).toHaveURL(/\/en\/dev\/kit$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.locator("header").getByRole("link", { name: "AL · Shqip" }).click();
    await expect(page).toHaveURL(/\/dev\/kit$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "sq");
  });

  test("localized links: Projects in German", async ({ page }) => {
    await open(page, "/de");
    await expect(page.locator("header").getByRole("link", { name: "Projekte" })).toHaveAttribute(
      "href",
      "/de/projekte",
    );
  });
});

test("WhatsApp button: hides while scrolling, returns after, hidden over the footer bottom bar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/sistemet");
  const fab = page.locator("[data-fab-visible]");
  await expect(fab).toHaveCount(1);
  // Keep scrolling: hidden and not clickable
  await page.mouse.move(700, 400);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(120);
  }
  await expect(fab).toHaveCount(0);
  // ~600ms after the last scroll it is back
  await expect(fab).toHaveCount(1, { timeout: 3000 });
  // Bottom of the page: footer bar visible → stays hidden
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await expect(page.locator("[data-footer-bottom]")).toBeInViewport();
  await expect(fab).toHaveCount(0);
});

test.describe("phone 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("mobile menu traps focus, locks scroll, closes with Esc", async ({ page }) => {
    await open(page, "/");
    const burger = page.getByRole("button", { name: "Hap menunë" });
    await burger.click();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const info = await activeInfo(page);
      expect(info.inHeader || info.inMobileMenu).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-menu")).toBeHidden();
    await expect(page.getByRole("button", { name: "Hap menunë" })).toBeFocused();
  });

  test("mobile menu accordion expands Sistemet", async ({ page }) => {
    await open(page, "/");
    await page.getByRole("button", { name: "Hap menunë" }).click();
    const systems = page.locator("#mobile-menu").getByRole("button", { name: /Sistemet/ });
    await systems.click();
    await expect(systems).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-menu").getByRole("link", { name: "Dritare" })).toBeVisible();
  });
});

// Owner's choice (C5): 1024–1199 uses the menu button, full links from 1200
for (const [width, compact] of [
  [1100, true],
  [1200, false],
] as const) {
  test(`navbar at ${width}px shows ${compact ? "menu button" : "full links"}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, "/");
    await expect(page.getByRole("button", { name: "Hap menunë" })).toBeVisible({ visible: compact });
    await expect(page.getByRole("button", { name: "Sistemet" })).toBeVisible({ visible: !compact });
  });
}

for (const width of [360, 390, 768, 1024, 1100, 1280, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "/");
    const overflow = await page.evaluate(() => {
      const header = document.querySelector("header .site-container") as HTMLElement;
      return {
        page: document.documentElement.scrollWidth - window.innerWidth,
        header: header.scrollWidth - header.clientWidth,
      };
    });
    expect(overflow.page).toBeLessThanOrEqual(0);
    expect(overflow.header).toBeLessThanOrEqual(0);
  });
}
