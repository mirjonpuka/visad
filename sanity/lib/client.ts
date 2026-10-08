import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioContentPath } from "../env";

/** Public, published-content client (CDN). Safe in any server context. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { studioUrl: studioContentPath },
});
