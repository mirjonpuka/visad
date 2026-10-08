import { getTranslations } from "next-intl/server";
import { HeroUnderNav } from "@/components/layout/LayoutUIProvider";
import { CMSImage } from "@/components/media/CMSImage";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Lines";
import { cmsHref } from "@/lib/links";
import { toSiteImage, type HomeData } from "@/sanity/lib/types";

type Props = { home: NonNullable<HomeData["home"]> };

/**
 * Home hero (UI §3.1): full-bleed image with focal point, bottom gradient,
 * content bottom-left, scroll cue bottom-right (laptop). Entrance and
 * parallax motion are added in Phase 5.
 */
export async function HomeHero({ home }: Props) {
  const t = await getTranslations();
  const ctas = (home.heroCtas ?? []).slice(0, 2);

  return (
    <section className="surface-dark relative isolate flex h-svh max-h-[980px] min-h-[600px] items-end overflow-hidden md:min-h-[720px]">
      <HeroUnderNav />
      <CMSImage
        image={toSiteImage(home.heroImage)}
        fill
        priority
        sizes="100vw"
        className="-z-20 rounded-none"
        placeholderNote="PHOTO: Home hero"
      />
      {/* Transparent at 45% → ink-900 75% at the bottom, for text contrast */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-45% to-[rgba(14,15,17,0.75)]"
      />
      {/* Extra shade under the navbar so white nav content stays readable on bright skies */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-56 bg-linear-to-b from-[rgba(14,15,17,0.7)] via-[rgba(14,15,17,0.35)] to-transparent"
      />

      <div className="site-container pb-14 md:pb-24">
        {home.heroEyebrow && (
          <p className="font-mono text-eyebrow text-text-on-dark-2 uppercase">{home.heroEyebrow}</p>
        )}
        <h1 className="mt-5 max-w-[1000px] text-display-xl text-balance">
          <Lines text={home.heroTitle} />
        </h1>
        {home.heroLead && (
          <p className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">{home.heroLead}</p>
        )}
        {ctas.length > 0 && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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

      {/* Scroll cue (laptop only): a red segment travelling down a 48px line */}
      <div
        aria-hidden
        className="absolute right-(--gutter) bottom-24 hidden flex-col items-center gap-4 laptop:flex"
      >
        <span className="font-mono text-label text-text-on-dark-2 uppercase [writing-mode:vertical-rl]">
          {t("home.scroll")}
        </span>
        <span className="scroll-cue relative h-12 w-px overflow-hidden bg-line-dark" />
      </div>
    </section>
  );
}
