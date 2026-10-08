import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AlternateSlugs } from "@/components/layout/AlternateSlugs";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ImageWipe } from "@/components/motion/reveals";
import { PageCta } from "@/components/sections/PageCta";
import { PageHero } from "@/components/sections/PageHero";
import { BenefitsGrid } from "@/components/ui/BenefitsGrid";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { DownloadsList } from "@/components/ui/DownloadsList";
import { ProjectTile } from "@/components/ui/ProjectTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SystemCard } from "@/components/ui/SystemCard";
import { permanentRedirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { localizedSlugParams, PLACEHOLDER_SLUG, slugMap } from "@/lib/static-params";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SOLUTION_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type SolutionData } from "@/sanity/lib/types";

type Props = { params: Promise<{ locale: string; segment: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return localizedSlugParams("solution", params.locale, "segment");
}

async function getSolution(slug: string) {
  if (slug === PLACEHOLDER_SLUG) return null;
  return sanityFetch<SolutionData>({
    query: SOLUTION_QUERY,
    params: { slug },
    tags: ["solution", "system", "project", "download", `solution:${slug}`],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment } = await params;
  const [solution, locale] = await Promise.all([getSolution(segment), getLocale()]);
  if (!solution) return {};
  return pageMetadata({
    locale,
    pathname: "/zgjidhje/[segment]",
    param: { key: "segment", slugs: slugMap(solution.slugs, routing.locales) },
    title: solution.title,
    description: solution.intro,
    seo: solution.seo,
  });
}

/** Solution template (UI §9), one per audience; the primary action depends on the segment. */
export default async function SolutionPage({ params }: Props) {
  const { segment } = await params;
  const [t, locale, solution] = await Promise.all([getTranslations(), getLocale(), getSolution(segment)]);
  if (!solution) notFound();
  if (solution.slug !== segment) {
    permanentRedirect({
      href: { pathname: "/zgjidhje/[segment]", params: { segment: solution.slug } },
      locale: locale as Locale,
    });
  }

  const systems = (solution.systems ?? []).filter(Boolean);
  // Segment CTA (UI §9.5): homeowners → WhatsApp first; developers/hotels → quote; architects → tender + downloads
  const kind = solution.ctaKind ?? "quote";
  const actions =
    kind === "whatsapp" ? (
      <>
        <WhatsAppButton className="w-full sm:w-auto" />
        <ButtonSecondary size="lg" href="/kontakt" className="w-full sm:w-auto">
          {t("cta.quoteForm")}
        </ButtonSecondary>
      </>
    ) : kind === "tender" ? (
      <ButtonPrimary size="lg" arrow href={{ pathname: "/kontakt", query: { forma: "tender" } }} className="w-full sm:w-auto">
        {t("solutionsPage.tenderForm")}
      </ButtonPrimary>
    ) : (
      <ButtonPrimary size="lg" arrow href="/kontakt" className="w-full sm:w-auto">
        {t("cta.quote")}
      </ButtonPrimary>
    );

  return (
    <>
      <AlternateSlugs slugs={slugMap(solution.slugs, routing.locales)} />
      <PageHero
        image={toSiteImage(solution.heroImage)}
        crumbs={[{ label: t("nav.solutions") }, { label: solution.title }]}
        eyebrow={solution.heroTitle ? solution.title : undefined}
        title={solution.heroTitle ?? solution.title}
        lead={solution.intro}
      >
        {actions}
      </PageHero>

      {(solution.benefits ?? []).length > 0 && (
        <section className="surface-light section-y">
          <div className="site-container">
            <SectionHeader title={t("solutionsPage.offer")} />
            <BenefitsGrid items={solution.benefits ?? []} columns={(solution.benefits ?? []).length === 3 ? 3 : 4} />
          </div>
        </section>
      )}

      {systems.length > 0 && (
        <section className="surface-light border-t hairline section-y">
          <div className="site-container">
            <SectionHeader title={t("solutionsPage.systems")} />
            <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 laptop:grid-cols-3">
              {systems.map((s) => (
                <li key={s._id}>
                  <SystemCard system={s} label={t("cta.details")} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {solution.projects.length > 0 && (
        <section className="surface-light border-t hairline section-y">
          <div className="site-container">
            <SectionHeader title={t("solutionsPage.projects")} />
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 laptop:grid-cols-3">
              {solution.projects.map((p, i) => (
                <li key={p._id} className="h-80 md:h-[400px]">
                  <ImageWipe index={i} className="h-full rounded-base">
                    <ProjectTile
                      title={p.title}
                      slug={p.slug}
                      meta={[p.city, p.systems?.[0], p.year].filter(Boolean).join(" · ")}
                      image={toSiteImage(p.coverImage)}
                      number={String(i + 1).padStart(2, "0")}
                      viewLabel={t("home.viewProject")}
                      sizes="(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="h-full"
                    />
                  </ImageWipe>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {solution.downloads.some((d) => d.url) && (
        <section className="surface-dark section-y">
          <div className="site-container">
            <SectionHeader title={t("systems.downloads")} />
            <DownloadsList items={solution.downloads} />
          </div>
        </section>
      )}

      <PageCta />
    </>
  );
}
