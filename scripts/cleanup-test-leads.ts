/**
 * Removes the leads created by the e2e form tests (name/contact "E2E Test")
 * from the private "leads" dataset. Usage: npm run test:cleanup-leads
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_LEADS_DATASET ?? "leads",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const query = `*[_type in ["quoteRequest","tenderRequest","jobApplication"] && (name == "E2E Test" || contactPerson == "E2E Test")]{ _id, _type, createdAt, "urls": [...coalesce(photos[].url, []), ...coalesce(documents[].url, []), cv.url] }`;

async function main() {
  const docs = await client.fetch<{ _id: string; _type: string; createdAt: string; urls: (string | null)[] }[]>(query);
  console.log(`Found ${docs.length} test lead(s):`, docs.map((d) => `${d._type} ${d.createdAt}`).join(", "));
  if (process.argv.includes("--keep")) return;
  // Uploaded test files (local fallback stores them as assets of this dataset)
  const urls = docs.flatMap((d) => d.urls).filter(Boolean);
  const assets = await client.fetch<string[]>(`*[_type == "sanity.fileAsset" && url in $urls]._id`, { urls });
  const tx = client.transaction();
  docs.forEach((d) => tx.delete(d._id));
  assets.forEach((id) => tx.delete(id));
  console.log(`Files: ${assets.length}`);
  if (docs.length) await tx.commit();
  console.log("Deleted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
