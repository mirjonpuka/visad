import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CMSImage } from "@/components/media/CMSImage";
import { ImageWipe, Reveal, SplitHeadline } from "@/components/motion/reveals";
import { PageCta } from "@/components/sections/PageCta";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonSecondary } from "@/components/ui/Button";
import { DownloadsList } from "@/components/ui/DownloadsList";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";
import { cn } from "@/lib/utils";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SYSTEMS_INDEX_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type SystemsIndexData } from "@/sanity/lib/types";

async function getData() {
  return sanityFetch<SystemsIndexData>({
    query: SYSTEMS_INDEX_QUERY,
    tags: ["pages", "system", "download"],
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, data] = await Promise.all([getTranslations(), getLocale(), getData()]);
  return pageMetadata({
    locale,
    pathname: "/sistemet",
    title: t("nav.systems"),
    description: data.page?.title ?? t("nav.systemsIntro"),
  });
}

/** Systems index (UI §4): hero, intro row, 6 alternating rows, downloads, CTA. */
export default async function SystemsPage() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const { page, systems, downloads } = await getData();
  const keySpecs = (page?.keySpecs ?? []).filter((s) => s.label && s.value);

  return (
    <>
      <PageHero
        image={toSiteImage(page?.hero ?? null)}
        placeholderNote="PHOTO: close-up of a modern aluminium window corner"
        crumbs={[{ label: t("nav.systems") }]}
        eyebrow={t("systems.eyebrow")}
        title={page?.title ?? t("nav.systemsIntro")}
      />

      {(page?.intro || keySpecs.length > 0) && (
        <section className="surface-dark border-t border-line-dark section-y">
          <div className="site-container grid-12 gap-y-10">
            {page?.intro && (
              <Reveal as="p" className="col-span-12 text-body-l text-text-on-dark-2 lg:col-span-6">
                {page.intro}
              </Reveal>
            )}
            {/* Only values from the ALUMIL datasheets (03 §4.2); hidden until confirmed */}
            {keySpecs.length > 0 && (
              <Reveal as="dl" stagger className="col-span-12 grid gap-6 sm:grid-cols-3 lg:col-span-5 lg:col-start-8">
                {keySpecs.map((spec, i) => (
                  <div key={i} className="border-t hairline pt-4">
                    <dt className="font-mono text-label text-text-on-dark-3 uppercase">{spec.label}</dt>
                    <dd className="mt-2 font-mono text-h4 tabular">
                      {spec.value} {spec.unit}
                    </dd>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </section>
      )}

      <section className="surface-light section-y-xl">
        <ol className="site-container flex flex-col gap-[120px]">
          {systems.map((system, i) => {
            const flip = i % 2 === 1;
            const features = (system.features ?? []).filter(Boolean);
            return (
              <li key={system._id} className="grid-12 items-center gap-y-8">
                <div className={cn("col-span-12 lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
                  <ImageWipe className="rounded-base">
                    <CMSImage
                      image={toSiteImage(system.image)}
                      ratio="16/10"
                      sizes="(min-width: 1440px) 780px, (min-width: 1024px) 56vw, 100vw"
                    />
                  </ImageWipe>
                </div>
                <div
                  className={cn(
                    "col-span-12 lg:col-span-4",
                    flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9",
                  )}
                >
                  <Reveal as="p" y={12} className="font-mono text-label text-red-700 tabular">
                    {String(i + 1).padStart(2, "0")}
                  </Reveal>
                  <SplitHeadline as="h2" className="mt-4 text-h2">
                    {system.title}
                  </SplitHeadline>
                  {system.text && (
                    <Reveal as="p" className="mt-5 text-body text-text-on-light-2">
                      {system.text}
                    </Reveal>
                  )}
                  {features.length > 0 && (
                    <Reveal as="ul" stagger className="mt-6 border-b hairline">
                      {features.map((feature) => (
                        <li key={feature} className="border-t hairline py-3 text-body-s">
                          {feature}
                        </li>
                      ))}
                    </Reveal>
                  )}
                  <Reveal className="mt-8">
                    <ButtonSecondary arrow href={{ pathname: "/sistemet/[slug]", params: { slug: system.slug } }}>
                      {t("systems.view")}
                    </ButtonSecondary>
                  </Reveal>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {downloads.some((d) => d.url) && (
        <section className="surface-dark section-y">
          <div className="site-container">
            <SplitHeadline as="h2" className="mb-12 text-h2">
              {t("systems.downloads")}
            </SplitHeadline>
            <DownloadsList items={downloads} />
          </div>
        </section>
      )}

      <PageCta />

      {/* ItemList of the systems (Architecture §8) */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("nav.systems"),
          itemListElement: systems.map((system, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: system.title,
            url: SITE_URL + getPathname({ href: { pathname: "/sistemet/[slug]", params: { slug: system.slug } }, locale: locale as Locale }),
          })),
        }}
      />
    </>
  );
}
