import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { SplitHeadline } from "@/components/motion/reveals";
import { PageCta } from "@/components/sections/PageCta";
import { ProjectsBrowser } from "@/components/sections/ProjectsBrowser";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PROJECTS_PAGE_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type ProjectsPageData } from "@/sanity/lib/types";

const TYPES = ["residential", "villa", "hotel", "commercial", "public"] as const;

async function getData() {
  return sanityFetch<ProjectsPageData>({ query: PROJECTS_PAGE_QUERY, tags: ["pages", "project", "system"] });
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, data] = await Promise.all([getTranslations(), getLocale(), getData()]);
  return pageMetadata({ locale, pathname: "/projektet", title: t("projectsPage.title"), description: data.intro });
}

/** Projects index (UI §6): header, sticky filters, editorial grid, load more, CTA. */
export default async function ProjectsPage() {
  const t = await getTranslations();
  const { intro, projects, systems } = await getData();

  return (
    <>
      <HeroMotion as="header" className="surface-light pt-(--navbar-h)">
        <div className="site-container pt-12 pb-12 md:pt-20 md:pb-16">
          <div data-hero-fade="">
            <Breadcrumbs items={[{ label: t("projectsPage.title") }]} />
          </div>
          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <SplitHeadline as="h1" trigger="manual" className="text-display-l">
                {t("projectsPage.title")}
              </SplitHeadline>
              <p data-hero-fade="" className="mt-4 font-mono text-label text-text-on-light-3 uppercase tabular">
                {t("projectsPage.count", { n: projects.length })}
              </p>
            </div>
            {intro && (
              <p data-hero-fade="" className="max-w-[420px] text-body text-text-on-light-2">
                {intro}
              </p>
            )}
          </div>
        </div>
      </HeroMotion>

      <ProjectsBrowser
        projects={projects.map((p) => ({
          id: p._id,
          title: p.title,
          slug: p.slug,
          city: p.city ?? null,
          year: p.year ?? null,
          type: p.projectType ?? null,
          systems: (p.systems ?? []).filter((s) => s?.key),
          image: toSiteImage(p.coverImage),
        }))}
        systems={systems.filter((s) => s.key)}
        labels={{
          type: t("projects.filters.type"),
          system: t("projects.filters.system"),
          city: t("projects.filters.city"),
          allCities: t("projectsPage.allCities"),
          clear: t("projects.filters.clear"),
          filter: t("projects.filters.filter"),
          show: t("projects.filters.show", { n: "{n}" }),
          loadMore: t("projects.filters.loadMore"),
          empty: t("projects.filters.empty"),
          close: t("projectsPage.close"),
          filtersLabel: t("projectsPage.filtersLabel"),
          viewProject: t("home.viewProject"),
          types: Object.fromEntries(TYPES.map((type) => [type, t(`projects.types.${type}`)])),
        }}
      />

      <PageCta />
    </>
  );
}
