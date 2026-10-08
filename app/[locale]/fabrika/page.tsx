import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CMSImage } from "@/components/media/CMSImage";
import { CountUp, ImageWipe, Reveal } from "@/components/motion/reveals";
import { FactoryProcess } from "@/components/sections/FactoryProcess";
import { MapVisit } from "@/components/sections/MapVisit";
import { PageCta } from "@/components/sections/PageCta";
import { PageHero } from "@/components/sections/PageHero";
import { AlumilLogo } from "@/components/ui/AlumilLogo";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSiteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { FACTORY_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type FactoryData } from "@/sanity/lib/types";

async function getData() {
  return sanityFetch<FactoryData>({ query: FACTORY_QUERY, tags: ["factory", "home", "settings", "certificate"] });
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, data] = await Promise.all([getTranslations(), getLocale(), getData()]);
  return pageMetadata({
    locale,
    pathname: "/fabrika",
    title: data.factory?.title ?? t("nav.factory"),
    description: data.factory?.intro ?? data.home?.factoryText,
    seo: data.factory?.seo,
  });
}

/** Factory / About (UI §8). Empty CMS sections are hidden (team, machinery…). */
export default async function FactoryPage() {
  const t = await getTranslations();
  const [data, site] = await Promise.all([getData(), getSiteData()]);
  const factory = data.factory;
  // Only real values: the factory's own stats, else the site-wide ones (both [TO CONFIRM] until the client confirms)
  const stats = (factory?.stats?.length ? factory.stats : (data.settings?.stats ?? [])).slice(0, 4);
  const steps = (factory?.processSteps ?? []).filter((s) => s.title);
  const machines = factory?.machinery ?? [];
  const certificates = factory?.certificates ?? [];
  const team = (factory?.team ?? []).filter((m) => m.name);
  const intro = factory?.intro ?? data.home?.factoryText;

  return (
    <>
      <PageHero
        image={toSiteImage(factory?.heroImage ?? null)}
        video={factory?.heroVideo}
        placeholderNote="PHOTO: wide shot of the Visad factory floor with machines"
        crumbs={[{ label: t("nav.factory") }]}
        eyebrow={t("factory.eyebrow")}
        title={factory?.title ?? t("nav.factory")}
        lead={intro}
        height="lg"
      />

      {stats.length > 0 && (
        <section className="surface-dark border-t border-line-dark" aria-label={t("home.statsLabel")}>
          <Reveal as="dl" stagger className="site-container grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.value + stat.label} className="flex flex-col-reverse gap-3 border-line-dark py-10 md:px-8 md:first:pl-0 laptop:border-l laptop:first:border-l-0">
                <dt className="text-body-s text-text-on-dark-2">{stat.label}</dt>
                <dd className="text-display-l leading-none">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {steps.length > 0 && (
        <FactoryProcess
          title={t("factory.process")}
          steps={steps.map((s) => ({ title: s.title!, text: s.text, image: toSiteImage(s.image) }))}
        />
      )}

      {machines.length > 0 && (
        <section className="surface-dark section-y">
          <div className="site-container">
            <SectionHeader title={t("factory.machinery")} />
            <ul className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 laptop:grid-cols-4">
              {machines.map((machine, i) => (
                <li key={i}>
                  <ImageWipe index={i} className="rounded-base">
                    <CMSImage image={toSiteImage(machine.image)} ratio="4/5" sizes="(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 100vw" />
                  </ImageWipe>
                  {machine.caption && <p className="mt-4 text-body-s text-text-on-dark-2">{machine.caption}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Always present: the ALUMIL band and footer link to #certifikata */}
      <section id="certifikata" className="surface-light scroll-mt-24 section-y">
        <div className="site-container">
          <SectionHeader title={t("factory.certificates")} />
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 laptop:grid-cols-3">
            <li className="flex flex-col gap-6 rounded-base border hairline p-8">
              <div className="flex h-[120px] items-center">
                <AlumilLogo cmsLogo={site.alumilLogo} width={200} />
              </div>
              <h3 className="text-h4">{t("factory.alumilCertificate")}</h3>
              {site.alumilText && <p className="text-body-s text-text-on-light-2">{site.alumilText}</p>}
              {data.settings?.alumilCertificate && (
                <LinkArrow mono externalHref={`${data.settings.alumilCertificate}?dl=`} className="mt-auto self-start">
                  {t("factory.downloadPdf")}
                </LinkArrow>
              )}
            </li>
            {certificates.map((cert) => (
              <li key={cert._id} className="flex flex-col gap-6 rounded-base border hairline p-8">
                <div className="flex h-[120px] items-center">
                  {cert.thumbnail?.assetId ? (
                    <CMSImage image={toSiteImage(cert.thumbnail)} sizes="200px" className="h-full w-auto" imgClassName="object-contain" />
                  ) : (
                    <FileText size={48} strokeWidth={1} aria-hidden className="text-text-on-light-3" />
                  )}
                </div>
                <h3 className="text-h4">{cert.title}</h3>
                {(cert.issuer || cert.year) && (
                  <p className="font-mono text-label text-text-on-light-3 uppercase">
                    {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
                  </p>
                )}
                {cert.url && (
                  <LinkArrow mono externalHref={`${cert.url}?dl=`} className="mt-auto self-start">
                    {t("factory.downloadPdf")}
                  </LinkArrow>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {team.length > 0 && (
        <section className="surface-light border-t hairline section-y">
          <div className="site-container">
            <SectionHeader title={t("factory.team")} />
            <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 laptop:grid-cols-4">
              {team.map((member, i) => (
                <li key={i}>
                  <CMSImage image={toSiteImage(member.photo)} ratio="4/5" sizes="(min-width: 1200px) 25vw, 50vw" />
                  <p className="mt-4 text-h4">{member.name}</p>
                  {member.role && <p className="mt-1 text-body-s text-text-on-light-2">{member.role}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <MapVisit
        title={t("factory.visit")}
        address={site.address}
        hours={site.openingHours}
        mapsUrl={site.mapsUrl}
        embedQuery={`VISAD Construction, ${site.address}`}
        labels={{
          address: t("factory.address"),
          hours: t("footer.hours"),
          directions: t("factory.directions"),
          loadMap: t("factory.loadMap"),
          mapNote: t("factory.mapNote"),
          mapTitle: t("factory.mapTitle"),
        }}
      />

      <PageCta />
    </>
  );
}
