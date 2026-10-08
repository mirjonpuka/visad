import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AlternateSlugs } from "@/components/layout/AlternateSlugs";
import { CMSImage } from "@/components/media/CMSImage";
import { Reveal, SplitHeadline } from "@/components/motion/reveals";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { PageCta } from "@/components/sections/PageCta";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { RichText, hasText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SystemCard } from "@/components/ui/SystemCard";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { sanityImageUrl } from "@/sanity/lib/image";
import { localizedSlugParams, PLACEHOLDER_SLUG, slugMap } from "@/lib/static-params";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PROJECT_PAGE_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type ProjectPageData } from "@/sanity/lib/types";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return localizedSlugParams("project", params.locale, "slug");
}

async function getData(slug: string) {
  if (slug === PLACEHOLDER_SLUG) return null;
  return sanityFetch<ProjectPageData>({
    query: PROJECT_PAGE_QUERY,
    params: { slug },
    tags: ["project", "system", `project:${slug}`],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [data, locale, t] = await Promise.all([getData(slug), getLocale(), getTranslations()]);
  const project = data?.project;
  if (!project) return {};
  // Without a CMS summary: a description from the project's own facts
  const facts = [
    project.projectType ? t(`projects.types.${project.projectType}` as "projects.types.villa") : null,
    project.city && !project.city.includes("[TO CONFIRM]") ? project.city : null,
    project.year,
  ].filter(Boolean);
  const systemNames = (project.systems ?? []).map((s) => s?.title).filter(Boolean).join(", ");
  const fallback = [`${project.title}${facts.length ? ` — ${facts.join(", ")}` : ""}.`, systemNames && `${t("projects.facts.systems")}: ${systemNames}.`, t("footer.about")]
    .filter(Boolean)
    .join(" ");
  return pageMetadata({
    locale,
    pathname: "/projektet/[slug]",
    param: { key: "slug", slugs: slugMap(project.slugs, routing.locales) },
    title: project.title,
    description: project.summary || fallback,
    seo: project.seo?.image?.assetId ? project.seo : { ...project.seo, image: project.coverImage },
  });
}

/** Project detail (UI §7): hero, facts bar, story, gallery, systems, next project, CTA. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [t, locale, data] = await Promise.all([getTranslations(), getLocale(), getData(slug)]);
  const project = data?.project;
  if (!project) notFound();
  if (project.slug !== slug) {
    permanentRedirect({ href: { pathname: "/projektet/[slug]", params: { slug: project.slug } }, locale: locale as Locale });
  }

  const typeLabel = project.projectType ? t(`projects.types.${project.projectType}` as "projects.types.villa") : null;
  const systems = (project.systems ?? []).filter(Boolean);
  const gallery = (project.gallery ?? []).map(toSiteImage).filter(Boolean) as NonNullable<ReturnType<typeof toSiteImage>>[];
  const order = data.order;
  const at = order.findIndex((p) => p._id === project._id);
  const next = order.length > 1 ? order[(at + 1) % order.length] : null;

  const facts = [
    project.client && { label: t("projects.facts.client"), value: project.client },
    typeLabel && { label: t("projects.facts.category"), value: typeLabel },
    project.areaM2 && { label: t("projects.facts.area"), value: `${project.areaM2.toLocaleString(locale)} m²` },
    systems.length > 0 && {
      label: t("projects.facts.systems"),
      value: (
        <ul className="flex flex-wrap gap-2">
          {systems.map((s) => (
            <li key={s._id}>
              <Link href={{ pathname: "/sistemet/[slug]", params: { slug: s.slug } }} className="chip">
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
    project.year && { label: t("projects.facts.year"), value: String(project.year) },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <>
      <AlternateSlugs slugs={slugMap(project.slugs, routing.locales)} />
      <ScrollProgress />

      <PageHero
        image={toSiteImage(project.coverImage)}
        crumbs={[{ label: t("projectsPage.title"), href: "/projektet" }, { label: project.title }]}
        title={project.title}
        meta={[project.city, project.year, typeLabel].filter(Boolean).join(" · ")}
        lead={project.summary}
        height="lg"
      />

      {facts.length > 0 && (
        <section className="surface-dark border-t border-line-dark">
          <Reveal
            as="dl"
            stagger
            className="site-container grid grid-cols-2 md:grid-cols-3 laptop:flex laptop:divide-x laptop:divide-line-dark"
          >
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-3 py-8 laptop:flex-1 laptop:px-8 laptop:first:pl-0">
                <dt className="font-mono text-label text-text-on-dark-3 uppercase">{fact.label}</dt>
                <dd className="text-h4">{fact.value}</dd>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {hasText(project.story) && (
        <section className="surface-light section-y">
          <div className="site-container grid-12 gap-y-8">
            <div className="col-span-12 lg:col-span-4">
              <h2 className="text-h3 lg:sticky lg:top-[calc(var(--navbar-h)+32px)]">{t("projects.facts.story")}</h2>
            </div>
            <RichText value={project.story} className="col-span-12 max-w-[640px] lg:col-span-7 lg:col-start-6" />
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="surface-light section-y" aria-label={t("projectsPage.gallery")}>
          <div className="site-container">
            <ProjectGallery
              images={gallery}
              labels={{
                open: t("projectsPage.photo", { n: "{n}", total: "{total}" }),
                counter: t("projectsPage.photo", { n: "{n}", total: "{total}" }),
                close: t("projectsPage.closeGallery"),
                prev: t("projectsPage.prev"),
                next: t("projectsPage.next"),
              }}
            />
          </div>
        </section>
      )}

      {systems.length > 0 && (
        <section className="surface-dark section-y">
          <div className="site-container">
            <SectionHeader title={t("projectsPage.systemsUsed")} />
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

      {next && (
        <section className="surface-dark">
          <Link
            href={{ pathname: "/projektet/[slug]", params: { slug: next.slug } }}
            data-title={next.title}
            data-cursor="view"
            className="group relative isolate flex min-h-[60vh] items-end overflow-hidden"
          >
            <div className="absolute inset-0 -z-10">
              <CMSImage
                image={toSiteImage(next.coverImage)}
                fill
                sizes="100vw"
                className="rounded-none"
                imgClassName="transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[rgba(14,15,17,0.72)] transition-colors duration-(--dur-l) ease-out-expo group-hover:bg-[rgba(14,15,17,0.45)]" />
            </div>
            <div className="site-container w-full py-16 md:py-24">
              <p className="font-mono text-label text-text-on-dark-2 uppercase">{t("projects.facts.next")} →</p>
              <SplitHeadline as="h2" className="mt-5 max-w-[1100px] text-display-l text-balance">
                {next.title}
              </SplitHeadline>
            </div>
          </Link>
        </section>
      )}

      <PageCta />

      {/* CreativeWork (Architecture §8): name, image, location */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          ...(project.summary ? { description: project.summary } : {}),
          ...(project.coverImage?.assetId
            ? { image: sanityImageUrl({ assetId: project.coverImage.assetId, crop: project.coverImage.crop ?? null }, 1600) }
            : {}),
          ...(project.city && !project.city.includes("[TO CONFIRM]")
            ? { locationCreated: { "@type": "Place", name: [project.city, project.country].filter(Boolean).join(", ") } }
            : {}),
          ...(project.year ? { dateCreated: String(project.year) } : {}),
          creator: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al"}/#business` },
        }}
      />
    </>
  );
}
