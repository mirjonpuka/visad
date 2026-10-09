import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { Reveal, SplitHeadline } from "@/components/motion/reveals";
import { PageCta } from "@/components/sections/PageCta";
import { PageHero } from "@/components/sections/PageHero";
import { BenefitsGrid } from "@/components/ui/BenefitsGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Link } from "@/i18n/navigation";
import { getFormConfig } from "@/lib/forms/config";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { CAREERS_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type CareersData } from "@/sanity/lib/types";

async function getData() {
  return sanityFetch<CareersData>({ query: CAREERS_QUERY, tags: ["pages", "job"] });
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, data] = await Promise.all([getTranslations(), getLocale(), getData()]);
  return pageMetadata({
    locale,
    pathname: "/karriera",
    title: t("careers.title"),
    description: data.page?.intro,
  });
}

/** Careers (UI §10): hero, benefits, open positions or the general application. */
export default async function CareersPage() {
  const t = await getTranslations();
  const { page, jobs } = await getData();

  return (
    <>
      <PageHero
        image={toSiteImage(page?.hero ?? null)}
        placeholderNote="PHOTO: Visad installers at work"
        crumbs={[{ label: t("nav.careers") }]}
        eyebrow={t("careers.eyebrow")}
        title={t("careers.title")}
        lead={page?.intro}
      />

      {(page?.benefits ?? []).length > 0 && (
        <section className="surface-light section-y">
          <div className="site-container">
            <SectionHeader title={t("careers.benefits")} />
            <BenefitsGrid items={page?.benefits ?? []} />
          </div>
        </section>
      )}

      <section id="pozicionet" className="surface-light border-t hairline section-y">
        <div className="site-container">
          {jobs.length > 0 ? (
            <>
              <SectionHeader title={t("careers.open")} />
              <Reveal as="ul" stagger className="border-b hairline">
                {jobs.map((job) => (
                  <li key={job._id} className="border-t hairline">
                    <Link
                      href={{ pathname: "/karriera/[slug]", params: { slug: job.slug } }}
                      className="group flex min-h-[88px] flex-wrap items-center gap-x-8 gap-y-2 py-6"
                    >
                      <span className="min-w-0 flex-1 basis-full text-h4 md:basis-auto">{job.title}</span>
                      {job.type && (
                        <span className="chip pointer-events-none">
                          {t(`careers.types.${job.type}` as "careers.types.full-time")}
                        </span>
                      )}
                      {job.location && (
                        <span className="font-mono text-label text-text-on-light-3 uppercase">
                          {job.location}
                        </span>
                      )}
                      <span className="link-arrow ml-auto font-mono text-label uppercase" aria-hidden>
                        <span>{t("careers.apply")}</span>
                        <span className="link-arrow__arrow">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </Reveal>
            </>
          ) : (
            // No open positions (owner brief D2): one centred column, the form right under the text
            <div className="mx-auto max-w-[720px]">
              <SplitHeadline as="h2" className="text-center text-h2 text-balance">
                {t("careers.generalTitle")}
              </SplitHeadline>
              <Reveal
                as="p"
                y={12}
                className="mt-5 text-center text-body-l text-balance text-text-on-light-2"
              >
                {t("careers.empty")}
              </Reveal>
              <div className="mt-10 md:mt-12">
                <JobApplicationForm config={getFormConfig()} />
              </div>
            </div>
          )}
        </div>
      </section>

      <PageCta />
    </>
  );
}
