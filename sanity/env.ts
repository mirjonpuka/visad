export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const leadsDataset = process.env.SANITY_LEADS_DATASET ?? "leads";
export const apiVersion = "2025-02-19";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID (see .env.local)");
}

/** Studio route and workspace base paths (embedded Studio, Architecture §2) */
export const studioBasePath = "/studio";
export const studioContentPath = "/studio/permbajtja";
export const studioLeadsPath = "/studio/kerkesat";

/** Languages: sq required, others fall back (Architecture §3, CMS §1) */
export const languages = [
  { id: "sq", title: "Shqip" },
  { id: "en", title: "English" },
  { id: "it", title: "Italiano" },
  { id: "de", title: "Deutsch" },
] as const;
