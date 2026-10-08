import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CMSImage } from "@/components/media/CMSImage";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { devRoutesEnabled } from "@/lib/dev";
import { sanityFetch } from "@/sanity/lib/fetch";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type ProjectListItem } from "@/sanity/lib/types";

export const metadata: Metadata = { title: "CMS check", robots: { index: false, follow: false } };

/**
 * Dev-only: shows the projects straight from Sanity so the Phase 3 loop can be
 * checked (edit in /studio → publish → refresh here) before the real pages exist.
 */
export default async function CmsCheckPage() {
  if (!devRoutesEnabled) notFound();
  const projects = await sanityFetch<ProjectListItem[]>({
    query: PROJECTS_QUERY,
    tags: ["project"],
  });

  return (
    <div className="surface-light pt-(--navbar-h)">
      <div className="site-container section-y">
        <Breadcrumbs items={[{ label: "Dev" }, { label: "CMS" }]} className="text-text-on-light-3" />
        <h1 className="mt-8 text-h1">Projektet nga Sanity</h1>
        <p className="mt-4 max-w-[560px] text-body-l text-text-on-light-2">
          {projects.length} projekte · ndrysho një projekt te /studio, publikoje dhe rifresko këtë faqe.
        </p>
        <ul className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 laptop:grid-cols-3">
          {projects.map((p) => (
            <li key={p._id}>
              <CMSImage
                image={toSiteImage(p.coverImage)}
                ratio="16/10"
                sizes="(min-width: 1200px) 30vw, (min-width: 768px) 45vw, 90vw"
              />
              <h2 className="mt-4 text-h4">{p.title}</h2>
              <p className="mt-1 font-mono text-label text-text-on-light-3 uppercase">
                {[p.city, p.year, p.projectType, p.slug].filter(Boolean).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
