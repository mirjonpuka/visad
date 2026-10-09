/**
 * Owner brief B3: public contact data — two e-mails (incl. the Gmail, which
 * replaces the earlier rule of not publishing it) and the full address.
 * Usage: npx tsx --env-file=.env.local scripts/migrations/004-contact-data.mts
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const result = await client
  .patch("siteSettings")
  .set({
    email: "info@visad.al",
    emails: ["info@visad.al", "visi.demaj.vd@gmail.com"],
    'address[_key=="sq"].value': "Rr. Shkodër–Koplik, km 10, Shkodër 4301, Albania",
  })
  .commit({ visibility: "async" });
console.log("siteSettings updated", result._rev);
