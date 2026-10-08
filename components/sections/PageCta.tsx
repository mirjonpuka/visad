import { sanityFetch } from "@/sanity/lib/fetch";
import { CTA_QUERY } from "@/sanity/lib/queries";
import { CtaBand } from "./CtaBand";

/** The Home CTA (UI §3.8) at the end of inner pages, same CMS copy. */
export async function PageCta() {
  const cta = await sanityFetch<{ title?: string | null; text?: string | null } | null>({
    query: CTA_QUERY,
    tags: ["home"],
  });
  return <CtaBand title={cta?.title} text={cta?.text} />;
}
