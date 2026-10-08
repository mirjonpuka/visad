import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AlternateSlugs } from "@/components/layout/AlternateSlugs";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { StickySubnav } from "@/components/layout/StickySubnav";
import { CMSImage } from "@/components/media/CMSImage";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { ImageWipe, Reveal, SplitHeadline } from "@/components/motion/reveals";
import { PageCta } from "@/components/sections/PageCta";
import { Accordion } from "@/components/ui/Accordion";
import { BenefitsGrid } from "@/components/ui/BenefitsGrid";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { DownloadsList } from "@/components/ui/DownloadsList";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { ProjectTile } from "@/components/ui/ProjectTile";
import { RichText, hasText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { permanentRedirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { localizedSlugParams, PLACEHOLDER_SLUG, slugMap } from "@/lib/static-params";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SYSTEM_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type SystemData } from "@/sanity/lib/types";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return localizedSlugParams("system", params.locale, "slug");
}

async function getSystem(slug: string) {
  if (slug === PLACEHOLDER_SLUG) return null;
  return sanityFetch<SystemData>({
    query: SYSTEM_QUERY,
    params: { slug },
    tags: ["system", "project", "download", "systemSeries", "finish", `system:${slug}`],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [system, locale] = await Promise.all([getSystem(slug), getLocale()]);
  if (!system) return {};
  return pageMetadata({
    locale,
    pathname: "/sistemet/[slug]",
    param: { key: "slug", slugs: slugMap(system.slugs, routing.locales) },
    title: system.title,
    description: system.text,
    seo: system.seo,
  });
}

/** System detail (UI §5). Sections without CMS content are left out. */
export default async function SystemPage({ params }: Props) {
  const { slug } = await params;
  const [t, locale, system] = await Promise.all([getTranslations(), getLocale(), getSystem(slug)]);
  if (!system) notFound();
  // A slug from another language → this language's URL
  if (system.slug !== slug) {
    permanentRedirect({ href: { pathname: "/sistemet/[slug]", params: { slug: system.slug } }, locale: locale as Locale });
  }

  const datasheet = (system.downloads ?? []).find((d) => d?.category === "datasheet" && d.url) ?? null;
  const downloads = (system.downloads ?? []).filter((d): d is NonNullable<typeof d> => Boolean(d?.url));
  const specs = (system.specs ?? []).filter((s) => s.label && s.value);
  const series = system.series ?? [];
  const finishes = system.finishes ?? [];
  const faqs = (system.faqs ?? []).filter((f) => f.question);
  const hasOverview = hasText(system.overview) || (system.benefits ?? []).length > 0;
  const hasTechnical = specs.length > 0 || Boolean(system.crossSection?.assetId) || downloads.length > 0;

  const subnav = [
    hasOverview && { id: "permbledhje", label: t("systems.overview") },
    series.length > 0 && { id: "serite", label: t("systems.series") },
    hasTechnical && { id: "detaje-teknike", label: t("systems.technical") },
    finishes.length > 0 && { id: "ngjyrat", label: t("systems.finishes") },
    system.projects.length > 0 && { id: "projekte", label: t("systems.projects") },
    faqs.length > 0 && { id: "pyetje", label: t("systems.faq") },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <>
      <AlternateSlugs slugs={slugMap(system.slugs, routing.locales)} />

      {/* Hero: text left, 4:5 image right; image first on phone (UI §5.1) */}
      <HeroMotion className="surface-dark pt-(--navbar-h)">
        <div className="site-container grid-12 gap-y-10 py-12 md:py-20">
          <div className="order-2 col-span-12 flex flex-col justify-end lg:order-1 lg:col-span-6">
            <div data-hero-fade="">
              <Breadcrumbs items={[{ label: t("nav.systems"), href: "/sistemet" }, { label: system.title }]} />
            </div>
            <p data-hero-fade="" className="mt-8 font-mono text-eyebrow text-text-on-dark-2 uppercase">
              {t("systems.eyebrow")}
            </p>
            <SplitHeadline as="h1" trigger="manual" className="mt-4 text-display-l text-balance">
              {system.title}
            </SplitHeadline>
            {system.text && (
              <p data-hero-fade="" className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">
                {system.text}
              </p>
            )}
            <div data-hero-fade="" className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonPrimary size="lg" arrow href="/kontakt">
                {t("cta.quote")}
              </ButtonPrimary>
              {datasheet?.url && (
                <ButtonSecondary size="lg" externalHref={`${datasheet.url}?dl=`}>
                  {t("cta.datasheet")}
                </ButtonSecondary>
              )}
            </div>
          </div>
          <div className="order-1 col-span-12 lg:order-2 lg:col-span-5 lg:col-start-8">
            <div data-hero-image="" className="overflow-hidden rounded-base">
              <CMSImage
                image={toSiteImage(system.heroImage)}
                ratio="4/5"
                priority
                sizes="(min-width: 1440px) 560px, (min-width: 1024px) 40vw, 100vw"
              />
            </div>
          </div>
        </div>
      </HeroMotion>

      <StickySubnav items={subnav} label={t("systems.subnav")} />

      {hasOverview && (
        <section id="permbledhje" className="surface-light scroll-mt-32 section-y">
          <div className="site-container">
            {hasText(system.overview) && (
              <div className="grid-12 gap-y-8">
                <SplitHeadline as="h2" className="col-span-12 text-h2 lg:col-span-4">
                  {t("systems.overview")}
                </SplitHeadline>
                <RichText value={system.overview} className="col-span-12 max-w-[640px] lg:col-span-7 lg:col-start-6" />
              </div>
            )}
            <BenefitsGrid items={system.benefits ?? []} className={hasText(system.overview) ? "mt-20" : undefined} />
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section id="serite" className="surface-light scroll-mt-32 border-t hairline section-y">
          <div className="site-container">
            <SectionHeader title={t("systems.seriesTitle")} />
            <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 laptop:grid-cols-3">
              {series.map((s, i) => (
                <li key={s._id} className="flex flex-col">
                  <ImageWipe index={i} className="rounded-base">
                    <CMSImage image={toSiteImage(s.image)} ratio="4/3" sizes="(min-width: 1200px) 30vw, (min-width: 768px) 50vw, 100vw" shortNote />
                  </ImageWipe>
                  <h3 className="mt-5 text-h4">{s.title}</h3>
                  {s.description && <p className="mt-2 text-body-s text-text-on-light-2">{s.description}</p>}
                  {(s.specs ?? []).length > 0 && (
                    <dl className="mt-4 border-b hairline">
                      {(s.specs ?? []).map((spec, j) => (
                        <div key={j} className="flex justify-between gap-4 border-t hairline py-2.5">
                          <dt className="text-body-s text-text-on-light-2">{spec.label}</dt>
                          <dd className="font-mono text-label tabular">
                            {spec.value} {spec.unit}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {s.datasheet && (
                    <LinkArrow mono externalHref={`${s.datasheet}?dl=`} className="mt-5 self-start">
                      {t("systems.datasheet")}
                    </LinkArrow>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {hasTechnical && (
        <section id="detaje-teknike" className="surface-dark scroll-mt-32 section-y">
          <div className="site-container grid-12 gap-y-12">
            <SplitHeadline as="h2" className="col-span-12 text-h2 lg:col-span-4">
              {t("systems.technical")}
            </SplitHeadline>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              {specs.length > 0 && (
                <table className="w-full border-b hairline text-left">
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">{t("systems.property")}</th>
                      <th scope="col">{t("systems.value")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((spec, i) => (
                      <tr key={i} className="border-t hairline">
                        <th scope="row" className="py-4 pr-6 text-body-s font-normal text-text-on-dark-2">
                          {spec.label}
                        </th>
                        <td className="py-4 text-right font-mono text-body-s tabular">
                          {spec.value} {spec.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {system.crossSection?.assetId && (
                <figure className="mt-12">
                  <CMSImage image={toSiteImage(system.crossSection)} sizes="(min-width: 1024px) 50vw, 100vw" className="bg-alu-100" imgClassName="object-contain" />
                  <figcaption className="mt-3 font-mono text-label text-text-on-dark-3 uppercase">
                    {t("systems.crossSection")}
                  </figcaption>
                </figure>
              )}
              {downloads.length > 0 && <DownloadsList items={downloads} className="mt-12" />}
            </div>
          </div>
        </section>
      )}

      {finishes.length > 0 && (
        <section id="ngjyrat" className="surface-light scroll-mt-32 section-y">
          <div className="site-container">
            <SectionHeader title={t("systems.finishes")} />
            <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 laptop:grid-cols-6">
              {finishes.map((f) => (
                <li key={f._id} className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-base border hairline"
                    style={{ background: f.swatch ?? undefined }}
                  >
                    {!f.swatch && f.image?.assetId && (
                      <CMSImage image={toSiteImage(f.image)} fill sizes="48px" decorative className="rounded-none" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-body-s">{f.name}</span>
                    {f.code && <span className="block font-mono text-label text-text-on-light-3 uppercase">{f.code}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {system.projects.length > 0 && (
        <section id="projekte" className="surface-light scroll-mt-32 border-t hairline section-y">
          <div className="site-container">
            <SectionHeader
              title={t("systems.relatedTitle")}
              aside={
                <LinkArrow href={{ pathname: "/projektet", query: { sistemi: system.slugs?.find((s) => s.language === "sq")?.slug ?? system.slug } }}>
                  {t("systems.allWithSystem")}
                </LinkArrow>
              }
            />
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 laptop:grid-cols-3">
              {system.projects.map((p, i) => (
                <li key={p._id} className="h-80 md:h-[400px]">
                  <ImageWipe index={i} className="h-full rounded-base">
                    <ProjectTile
                      title={p.title}
                      slug={p.slug}
                      meta={[p.city, p.year].filter(Boolean).join(" · ")}
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

      {faqs.length > 0 && (
        <section id="pyetje" className="surface-light scroll-mt-32 border-t hairline section-y">
          <div className="site-container grid-12 gap-y-10">
            <SplitHeadline as="h2" className="col-span-12 text-h2 lg:col-span-4">
              {t("systems.faqTitle")}
            </SplitHeadline>
            <Reveal className="col-span-12 lg:col-span-7 lg:col-start-6">
              <Accordion
                size="sm"
                defaultOpen={null}
                items={faqs.map((f, i) => ({
                  id: String(i),
                  title: f.question,
                  content: <RichText value={f.answer} className="max-w-[560px]" />,
                }))}
              />
            </Reveal>
          </div>
        </section>
      )}

      <PageCta />
    </>
  );
}
