import "server-only";
import { client } from "./client";
import { leadsDataset } from "../env";

/** Draft-capable reader (draft mode / Presentation). Token never reaches the browser. */
export const previewClient = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: "drafts",
});

/** Server-only writer for the private leads dataset (Architecture §7, Phase 8). */
export function leadsWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  return client.withConfig({ token, dataset: leadsDataset, useCdn: false, perspective: "raw" });
}
