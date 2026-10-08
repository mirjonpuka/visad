import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AlternateSlugs } from "@/components/layout/AlternateSlugs";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { SplitHeadline } from "@/components/motion/reveals";
import { RichText } from "@/components/ui/RichText";
import { permanentRedirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { localizedSlugParams, PLACEHOLDER_SLUG, slugMap } from "@/lib/static-params";
import { sanityFetch } from "@/sanity/lib/fetch";
import { JOB_QUERY } from "@/sanity/lib/queries";
import type { JobData } from "@/sanity/lib/types";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return localizedSlugParams("job", params.locale, "slug");
}

async function getJob(slug: string) {
  if (slug === PLACEHOLDER_SLUG) return null;
  return sanityFetch<JobData>({ query: JOB_QUERY, params: { slug }, tags: ["job", `job:${slug}`] });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [job, locale] = await Promise.all([getJob(slug), getLocale()]);
  if (!job) return {};
  return pageMetadata({
    locale,
    pathname: "/karriera/[slug]",
    param: { key: "slug", slugs: slugMap(job.slugs, routing.locales) },
    title: job.title,
  });
}

/** Job detail (UI §10): description + application form. */
export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const [t, locale, job] = await Promise.all([getTranslations(), getLocale(), getJob(slug)]);
  if (!job) notFound();
  if (job.slug !== slug) {
    permanentRedirect({ href: { pathname: "/karriera/[slug]", params: { slug: job.slug } }, locale: locale as Locale });
  }

  return (
    <>
      <AlternateSlugs slugs={slugMap(job.slugs, routing.locales)} />
      <article className="surface-light pt-(--navbar-h)">
        <div className="site-container section-y grid-12 gap-y-12">
          <header className="col-span-12">
            <Breadcrumbs
              items={[{ label: t("nav.careers"), href: "/karriera" }, { label: job.title }]}
              className="text-text-on-light-3"
            />
            <SplitHeadline as="h1" className="mt-8 max-w-[900px] text-h1 text-balance">
              {job.title}
            </SplitHeadline>
            <p className="mt-5 font-mono text-label text-text-on-light-3 uppercase">
              {[job.type && t(`careers.types.${job.type}` as "careers.types.full-time"), job.location]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </header>
          <RichText value={job.description} className="col-span-12 max-w-[640px] lg:col-span-6" />
          <section className="col-span-12 lg:col-span-5 lg:col-start-8" aria-labelledby="apliko">
            <h2 id="apliko" className="text-h3">
              {t("careers.applyTitle")}
            </h2>
            <div className="mt-8">
              <JobApplicationForm jobId={job._id} jobTitle={job.title} />
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
