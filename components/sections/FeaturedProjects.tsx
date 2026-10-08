import { getTranslations } from "next-intl/server";
import { ImageWipe } from "@/components/motion/reveals";
import { ButtonSecondary } from "@/components/ui/Button";
import { ProjectTile } from "@/components/ui/ProjectTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import { toSiteImage, type HomeData } from "@/sanity/lib/types";

/*
 * Asymmetric editorial grid (UI §3.4), laptop: 12 columns, 290px rows.
 *   1: cols 1–7, 2 rows   2: cols 8–12   3: cols 8–12
 *   4: cols 1–5, 2 rows   5: cols 6–12, 2 rows
 * Tablet: 2 columns, 360px, tile 1 spans both. Phone: 1 column, 320px.
 */
const TILE_LAYOUT = [
  "md:col-span-2 laptop:col-span-7 laptop:col-start-1 laptop:row-span-2 laptop:row-start-1",
  "laptop:col-span-5 laptop:col-start-8 laptop:row-start-1",
  "laptop:col-span-5 laptop:col-start-8 laptop:row-start-2",
  "laptop:col-span-5 laptop:col-start-1 laptop:row-span-2 laptop:row-start-3",
  "laptop:col-span-7 laptop:col-start-6 laptop:row-span-2 laptop:row-start-3",
];
const TILE_SIZES = [
  "(min-width: 1200px) 58vw, (min-width: 768px) 100vw, 100vw",
  "(min-width: 1200px) 41vw, (min-width: 768px) 50vw, 100vw",
  "(min-width: 1200px) 41vw, (min-width: 768px) 50vw, 100vw",
  "(min-width: 1200px) 41vw, (min-width: 768px) 50vw, 100vw",
  "(min-width: 1200px) 58vw, (min-width: 768px) 50vw, 100vw",
];

type Props = {
  title?: string | null;
  intro?: string | null;
  projects: HomeData["featured"];
};

export async function FeaturedProjects({ title, intro, projects }: Props) {
  const t = await getTranslations();
  if (!projects.length) return null;

  return (
    <section id="projektet" className="surface-light section-y">
      <div className="site-container">
        <SectionHeader eyebrow={t("home.projectsEyebrow")} title={title} aside={intro} />

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 laptop:auto-rows-[290px] laptop:grid-cols-12">
          {projects.slice(0, 5).map((project, i) => (
            <li key={project._id} className={cn("h-80 md:h-[360px] laptop:h-auto", TILE_LAYOUT[i])}>
              {/* Tiles wipe in, staggered 80ms (UI §3.4, Motion §4.3) */}
              <ImageWipe index={i} className="h-full rounded-base">
              <ProjectTile
                title={project.title}
                slug={project.slug}
                meta={[project.city, project.systems?.[0], project.year].filter(Boolean).join(" · ")}
                image={toSiteImage(project.coverImage)}
                number={String(i + 1).padStart(2, "0")}
                viewLabel={t("home.viewProject")}
                sizes={TILE_SIZES[i]}
                className="h-full"
              />
              </ImageWipe>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex justify-center">
          <ButtonSecondary size="lg" arrow href="/projektet">
            {t("cta.allProjects")}
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
}
