import { getTranslations } from "next-intl/server";
import { HeroUnderNav } from "@/components/layout/LayoutUIProvider";
import { CMSImage } from "@/components/media/CMSImage";
import { HeroSlideshow } from "@/components/media/HeroSlideshow";
import { HeroVideo } from "@/components/media/HeroVideo";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { SplitHeadline } from "@/components/motion/reveals";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Lines";
import { cmsHref } from "@/lib/links";
import { toSiteImage, type HomeData } from "@/sanity/lib/types";

type Props = { home: NonNullable<HomeData["home"]> };

/**
 * Home hero (UI §3.1): full-bleed image with focal point, bottom gradient,
 * content bottom-left, scroll cue bottom-right (laptop). Entrance after the
 * intro: headline lines rise, eyebrow/lead/buttons fade up, image settles from
 * 1.08 → 1; parallax + slight darkening on scroll (Motion §2, §4.4).
 */
export async function HomeHero({ home }: Props) {
  const t = await getTranslations();
  const ctas = (home.heroCtas ?? []).slice(0, 2);
  // Slideshow photos (CMS "Fotot e hero-s"), else the single hero photo
  const slides = ((home.heroImages ?? []).map(toSiteImage).filter(Boolean) as NonNullable<ReturnType<typeof toSiteImage>>[]);
  if (!slides.length && home.heroImage) slides.push(toSiteImage(home.heroImage)!);

  return (
    <HeroMotion className="surface-dark relative isolate flex h-svh max-h-[980px] min-h-[600px] flex-col overflow-hidden md:min-h-[720px]">
      <HeroUnderNav />
      <div data-hero-parallax="" className="absolute inset-0 -z-20">
        <div data-hero-image="" className="absolute inset-0">
          {slides.length > 1 ? (
            <HeroSlideshow images={slides} placeholderNote="PHOTO: Home hero" />
          ) : (
            <CMSImage
              image={slides[0] ?? null}
              fill
              priority
              sizes="100vw"
              className="rounded-none"
              placeholderNote="PHOTO: Home hero"
            />
          )}
          {home.heroVideo && <HeroVideo src={home.heroVideo} />}
        </div>
      </div>
      {/* Transparent at 45% → ink-900 75% at the bottom, for text contrast */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-45% to-[rgba(14,15,17,0.75)]"
      />
      {/* Left shade so the headline stays readable on every slideshow photo */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 -z-10 w-full bg-linear-to-r from-[rgba(14,15,17,0.55)] via-[rgba(14,15,17,0.2)] via-50% to-transparent md:w-3/4"
      />
      {/* Extra shade under the navbar so white nav content stays readable on bright skies */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-56 bg-linear-to-b from-[rgba(14,15,17,0.7)] via-[rgba(14,15,17,0.35)] to-transparent"
      />

      {/* Owner brief C1: the block's centre sits at ~57% of the hero height (space 9 : 5 around
          it) on tablet/laptop instead of resting on the bottom; phones keep it lower (3 : 1) */}
      <div aria-hidden className="min-h-(--navbar-h) flex-[3] md:flex-[9]" />
      <div className="site-container w-full">
        {home.heroEyebrow && (
          <p data-hero-fade="" className="font-mono text-eyebrow text-text-on-dark-2 uppercase">
            {home.heroEyebrow}
          </p>
        )}
        <SplitHeadline as="h1" trigger="manual" className="mt-5 max-w-[1000px] text-display-xl text-balance">
          <Lines text={home.heroTitle} />
        </SplitHeadline>
        {home.heroLead && (
          <p data-hero-fade="" className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">
            {home.heroLead}
          </p>
        )}
        {ctas.length > 0 && (
          <div data-hero-fade="" className="mt-10 flex flex-col gap-3 sm:flex-row">
            {ctas.map((cta, i) => {
              const link = cmsHref(cta.href);
              if (!link || !cta.label) return null;
              return cta.kind === "secondary" ? (
                <ButtonSecondary key={i} size="lg" className="w-full sm:w-auto" {...link}>
                  {cta.label}
                </ButtonSecondary>
              ) : (
                <ButtonPrimary key={i} size="lg" arrow className="w-full sm:w-auto" {...link}>
                  {cta.label}
                </ButtonPrimary>
              );
            })}
          </div>
        )}
      </div>
      <div aria-hidden className="min-h-14 flex-[1] md:flex-[5]" />

      {/* Scroll cue (laptop only): a red segment travelling down a 48px line */}
      <div
        aria-hidden
        data-hero-fade=""
        className="absolute right-(--gutter) bottom-24 hidden flex-col items-center gap-4 laptop:flex"
      >
        <span className="font-mono text-label text-text-on-dark-2 uppercase [writing-mode:vertical-rl]">
          {t("home.scroll")}
        </span>
        <span className="scroll-cue relative h-12 w-px overflow-hidden bg-line-dark" />
      </div>
    </HeroMotion>
  );
}
