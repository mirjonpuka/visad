import { expect, test, type Page } from "@playwright/test";

// Phase 8 acceptance: each form validates inline, uploads with progress,
// creates a lead (Sanity "leads" dataset) and shows the success panel; errors
// keep the user's data. Test leads are named "E2E Test" and removed by
// `npm run test:cleanup-leads`.

const NAME = "E2E Test";
// 1×1 PNG and a tiny PDF
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

// Not "networkidle": the Turnstile widget keeps the network busy
async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "load" });
}

test.describe.configure({ mode: "serial" });

test("quote form: step validation, upload, submit → success panel", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/kontakt");
  const form = page.locator("#formulari form:visible");

  // Step 1 has no required fields: Continue goes to step 2 (retried: hydration)
  await expect(async () => {
    await form.getByRole("checkbox", { name: "Dritare" }).click();
    await expect(form.getByRole("checkbox", { name: "Dritare" })).toHaveAttribute("aria-checked", "true", { timeout: 1000 });
  }).toPass();
  await form.getByRole("radio", { name: "Rinovim" }).click();
  await form.getByRole("button", { name: "Më shumë" }).click();
  await form.getByLabel("Qyteti").fill("Shkodër");
  await form.getByRole("button", { name: /Vazhdo/ }).click();
  await expect(form.getByRole("heading", { name: "Kontakti" })).toBeVisible();

  // Submit empty → inline errors, nothing sent
  await form.getByRole("button", { name: /Dërgo kërkesën/ }).click();
  await expect(form.getByText("Kjo fushë është e detyrueshme.").first()).toBeVisible();
  await expect(form.getByText("Duhet të pranoni politikën e privatësisë.")).toBeVisible();

  // Phone validated on blur
  await form.getByLabel(/^Telefoni/).fill("12");
  await form.getByLabel(/^Telefoni/).blur();
  await expect(form.getByText("Shkruani një numër telefoni të vlefshëm.")).toBeVisible();

  await form.getByLabel(/^Emri dhe mbiemri/).fill(NAME);
  await form.getByLabel(/^Telefoni/).fill("+355 67 000 0000");
  await form.getByLabel(/^Telefoni/).blur();
  await expect(form.getByText("Shkruani një numër telefoni të vlefshëm.")).toHaveCount(0);

  await form.locator('input[type="file"]').setInputFiles({ name: "objekti.png", mimeType: "image/png", buffer: PNG });
  await expect(form.getByText("U ngarkua")).toBeVisible({ timeout: 30_000 });

  await form.getByLabel(/^Mesazhi/).fill("Test automatik — fshijeni.");
  await form.getByRole("checkbox", { name: /Pranoj politikën/ }).check();
  await form.getByRole("button", { name: /Dërgo kërkesën/ }).click();
  await expect(page.getByRole("status")).toContainText("Faleminderit", { timeout: 30_000 });
});

test("tender form: preselected by ?forma=tender, submit → success", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/kontakt?forma=tender");
  await expect(page.getByRole("tab", { name: "Tender / B2B" })).toHaveAttribute("aria-selected", "true");
  const form = page.locator("#formulari form:visible");
  await form.getByLabel(/^Kompania/).fill(`${NAME} Sh.p.k.`);
  await form.getByLabel(/^Personi i kontaktit/).fill(NAME);
  await form.getByLabel(/^Telefoni/).fill("+355 67 000 0000");
  await form.getByLabel(/^Email/).fill("e2e@example.com");
  await form.getByRole("radio", { name: "Tender" }).click();
  await form.getByLabel(/^Sipërfaqja/).fill("1200");
  await form.locator('input[type="file"]').setInputFiles({ name: "plani.pdf", mimeType: "application/pdf", buffer: PDF });
  await expect(form.getByText("U ngarkua")).toBeVisible({ timeout: 30_000 });
  // Wrong type is refused before upload
  await form.locator('input[type="file"]').setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: PNG });
  await expect(form.getByText("Ky lloj skedari nuk lejohet.")).toBeVisible();
  await form.getByRole("checkbox", { name: /Pranoj politikën/ }).check();
  await form.getByRole("button", { name: /Dërgo kërkesën/ }).click();
  await expect(page.getByRole("status")).toContainText("Faleminderit", { timeout: 30_000 });
});

test("job application (general): CV required, submit → success", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/karriera");
  const form = page.locator("#pozicionet form");
  await form.getByLabel(/^Emri dhe mbiemri/).fill(NAME);
  await form.getByLabel(/^Telefoni/).fill("+355 67 000 0000");
  await form.getByRole("checkbox", { name: /Pranoj politikën/ }).check();
  await expect(async () => {
    await form.getByRole("button", { name: /Dërgo kërkesën/ }).click();
    await expect(form.getByText("Ngarkoni CV-në tuaj.")).toBeVisible({ timeout: 1000 });
  }).toPass();
  await form.locator('input[type="file"]').setInputFiles({ name: "cv.pdf", mimeType: "application/pdf", buffer: PDF });
  await expect(form.getByText("U ngarkua")).toBeVisible({ timeout: 30_000 });
  await form.getByRole("button", { name: /Dërgo kërkesën/ }).click();
  await expect(page.getByRole("status")).toContainText("Faleminderit", { timeout: 30_000 });
});
