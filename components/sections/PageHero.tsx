import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { HeroUnderNav } from "@/components/layout/LayoutUIProvider";
import { CMSImage } from "@/components/media/CMSImage";
import { HeroVideo } from "@/components/media/HeroVideo";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { SplitHeadline } from "@/components/motion/reveals";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

const HEIGHTS = {
  /** Systems index, solutions, careers (UI §4.1) */
  md: "h-[70vh] min-h-[560px]",
  /** Project detail (UI §7.1), factory */
  lg: "h-[90vh] min-h-[600px]",
};

type Props = {
  image: SiteImage | null;
  video?: string | null;
  placeholderNote?: string;
  crumbs: Crumb[];
  eyebrow?: ReactNode;
  title: string;
  lead?: string | null;
  /** Mono meta row under the title (project: city · year · type) */
  meta?: string | null;
  height?: keyof typeof HEIGHTS;
  /** Buttons */
  children?: ReactNode;
};

/**
 * Full-bleed dark hero for inner pages: image with focal point and bottom
 * gradient, breadcrumbs above the h1, content bottom-left. Same entrance and
 * parallax as the Home hero (Motion §2, §4.4).
 */
export function PageHero({
  image,
  video,
  placeholderNote,
  crumbs,
  eyebrow,
  title,
  lead,
  meta,
  height = "md",
  children,
}: Props) {
  return (
    <HeroMotion
      className={cn("surface-dark relative isolate flex items-end overflow-hidden", HEIGHTS[height])}
    >
      <HeroUnderNav />
      <div data-hero-parallax="" className="absolute inset-0 -z-20">
        <div data-hero-image="" className="absolute inset-0">
          <CMSImage
            image={image}
            fill
            priority
            sizes="100vw"
            className="rounded-none"
            placeholderNote={placeholderNote}
          />
          {video && <HeroVideo src={video} />}
        </div>
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-[rgba(14,15,17,0.35)] from-0% via-[rgba(14,15,17,0.2)] via-45% to-[rgba(14,15,17,0.8)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-56 bg-linear-to-b from-[rgba(14,15,17,0.6)] to-transparent"
      />

      <div className="site-container w-full pb-12 md:pb-20">
        <div data-hero-fade="">
          <Breadcrumbs items={crumbs} />
        </div>
        {eyebrow && (
          <p data-hero-fade="" className="mt-8 font-mono text-eyebrow text-text-on-dark-2 uppercase">
            {eyebrow}
          </p>
        )}
        <SplitHeadline
          as="h1"
          trigger="manual"
          className={cn("max-w-[1100px] text-display-l text-balance", eyebrow ? "mt-4" : "mt-8")}
        >
          {title}
        </SplitHeadline>
        {meta && (
          <p data-hero-fade="" className="mt-5 font-mono text-label text-text-on-dark-2 uppercase">
            {meta}
          </p>
        )}
        {lead && (
          <p data-hero-fade="" className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">
            {lead}
          </p>
        )}
        {children && (
          <div data-hero-fade="" className="mt-10 flex flex-col gap-3 sm:flex-row">
            {children}
          </div>
        )}
      </div>
    </HeroMotion>
  );
}
