import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { AlumilBand } from "@/components/sections/AlumilBand";
import { CtaBand } from "@/components/sections/CtaBand";
import { FactoryTeaser } from "@/components/sections/FactoryTeaser";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { HomeHero } from "@/components/sections/HomeHero";
import { ProfileStory } from "@/components/sections/ProfileStory";
import { Solutions } from "@/components/sections/Solutions";
import { StatsBand } from "@/components/sections/StatsBand";
import { SystemsAccordion } from "@/components/sections/SystemsAccordion";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSiteData } from "@/lib/site-data";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type HomeData } from "@/sanity/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  return {
    ...pageMetadata({
      locale,
      pathname: "/",
      title: "VISAD Construction",
      description: t("footer.about"),
    }),
    // The layout template would add "· VISAD" to the brand name
    title: { absolute: `VISAD Construction — ${t("nav.tagline")}` },
  };
}

/** Home (UI §3): sections 3.1–3.8. Motion is added in Phase 5, the 3D scene in Phase 6. */
export default async function HomePage() {
  const t = await getTranslations();
  const [data, site] = await Promise.all([
    sanityFetch<HomeData>({ query: HOME_QUERY, tags: ["home", "settings", "system", "project"] }),
    getSiteData(),
  ]);
  const home = data.home;
  if (!home) notFound();

  return (
    <>
      <HomeHero home={home} />
      <StatsBand stats={data.settings?.stats ?? []} />

      {/* With the 3D scene the pinned block starts at the section top (owner brief C3) */}
      <section id="sistemet" className="surface-dark border-t border-line-dark section-y has-[[data-profile-scene]]:pt-0">
        <div className="site-container">
          <ProfileStory title={home.profileStoryTitle} steps={home.profileStorySteps ?? []} />
          <div className="mt-20 laptop:mt-28">
            <SectionHeader
              className="mb-8 laptop:mb-10"
              title={home.systemsTitle}
              aside={<LinkArrow href="/sistemet">{t("cta.allSystems")}</LinkArrow>}
            />
            <SystemsAccordion
              systems={data.systems.map((s) => ({
                id: s._id,
                title: s.title,
                slug: s.slug,
                text: s.text,
                image: toSiteImage(s.image),
                hasDatasheet: s.hasDatasheet,
              }))}
            />
          </div>
        </div>
      </section>

      <FeaturedProjects
        title={home.featuredProjectsTitle}
        intro={home.featuredProjectsIntro}
        projects={data.featured}
      />
      <FactoryTeaser home={home} />
      <Solutions title={home.solutionsTitle} solutions={site.solutions} />
      <AlumilBand text={site.alumilText} logo={site.alumilLogo} />
      <CtaBand title={home.ctaTitle} text={home.ctaText} />
    </>
  );
}
