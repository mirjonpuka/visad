import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RichText } from "@/components/ui/RichText";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { LEGAL_QUERY } from "@/sanity/lib/queries";
import type { LegalData } from "@/sanity/lib/types";

async function getPage() {
  return sanityFetch<LegalData>({ query: LEGAL_QUERY, params: { id: "legal-privacy" }, tags: ["legalPage"] });
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, page] = await Promise.all([getTranslations(), getLocale(), getPage()]);
  return pageMetadata({ locale, pathname: "/privatesia", title: page?.title ?? t("footer.privacy") });
}

/** Privacy (UI §12): simple light page, rich text, max-width 720px. */
export default async function PrivacyPage() {
  const [format, page] = await Promise.all([getFormatter(), getPage()]);
  if (!page) notFound();

  return (
    <article className="surface-light pt-(--navbar-h)">
      <div className="site-container section-y">
        <div className="mx-auto max-w-[720px]">
          <Breadcrumbs items={[{ label: page.title }]} className="text-text-on-light-3" />
          <h1 className="mt-8 text-h1">{page.title}</h1>
          <p className="mt-4 font-mono text-label text-text-on-light-3 uppercase">
            <time dateTime={page._updatedAt}>{format.dateTime(new Date(page._updatedAt), { dateStyle: "long" })}</time>
          </p>
          <RichText value={page.body} className="mt-12" />
        </div>
      </div>
    </article>
  );
}
