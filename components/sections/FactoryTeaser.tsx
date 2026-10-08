import { getTranslations } from "next-intl/server";
import { CMSImage } from "@/components/media/CMSImage";
import { Parallax, Reveal, SplitHeadline } from "@/components/motion/reveals";
import { Lines } from "@/components/ui/Lines";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { toSiteImage, type HomeData } from "@/sanity/lib/types";

type Home = NonNullable<HomeData["home"]>;

/**
 * Factory teaser (UI §3.5): text + 3 steps (40%) and an image grid (60%):
 * one wide image (420px) over two (260px). On phone the images become a
 * horizontal swipe carousel with 85% cards. Parallax in Phase 5.
 */
export async function FactoryTeaser({ home }: { home: Home }) {
  const t = await getTranslations("home");
  const [wide, left, right] = (home.factoryImages ?? []).map(toSiteImage);
  const images = [wide, left, right];

  return (
    <section id="fabrika" className="surface-dark section-y">
      <div className="site-container grid grid-cols-1 gap-14 laptop:grid-cols-[40fr_60fr] laptop:gap-16">
        <div>
          <Reveal as="p" y={12} className="font-mono text-eyebrow text-text-on-dark-3 uppercase">
            {t("factoryEyebrow")}
          </Reveal>
          <SplitHeadline as="h2" className="mt-5 text-h2">
            <Lines text={home.factoryTitle} />
          </SplitHeadline>
          {home.factoryText && (
            <Reveal as="p" className="mt-6 max-w-[560px] text-body text-text-on-dark-2">
              {home.factoryText}
            </Reveal>
          )}

          {/* Steps reveal one by one (UI §3.5) */}
          <Reveal as="ol" stagger className="mt-10 border-b border-line-dark">
            {(home.factorySteps ?? []).map((step, i) => (
              <li key={i} className="grid grid-cols-[48px_1fr] gap-y-1 border-t border-line-dark py-5">
                <span className="font-mono text-label text-red-text-on-dark tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-h4">{step.title}</h3>
                {step.text && <p className="col-start-2 text-body-s text-text-on-dark-2">{step.text}</p>}
              </li>
            ))}
          </Reveal>

          <LinkArrow href="/fabrika" className="mt-10">
            {t("factoryLink")}
          </LinkArrow>
        </div>

        {/* Laptop & tablet: 1 wide + 2 below */}
        <div className="hidden grid-cols-2 gap-5 md:grid">
          {/* Images move at different speeds (0.9 / 1.05, Motion §4.4); oversized so no edge shows */}
          <div className="relative col-span-2 h-[420px] overflow-hidden rounded-base">
            <Parallax amount={5} className="absolute inset-x-0 -inset-y-[8%]">
              <CMSImage image={wide} fill sizes="(min-width: 1200px) 760px, 100vw" className="rounded-none" />
            </Parallax>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-base">
            <Parallax amount={-4} className="absolute inset-x-0 -inset-y-[8%]">
              <CMSImage image={left} fill sizes="(min-width: 1200px) 370px, 50vw" className="rounded-none" />
            </Parallax>
          </div>
          <div className="relative h-[260px] overflow-hidden rounded-base">
            <Parallax amount={-4} className="absolute inset-x-0 -inset-y-[8%]">
              <CMSImage image={right} fill sizes="(min-width: 1200px) 370px, 50vw" className="rounded-none" />
            </Parallax>
          </div>
        </div>

        {/* Phone: swipe carousel (scroll-snap), 85% cards */}
        <ul
          aria-label={t("factoryEyebrow")}
          // Scrollable region must be keyboard reachable (axe: scrollable-region-focusable)
          tabIndex={0}
          data-cursor="drag"
          className="-mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) [scrollbar-width:none] gap-4 overflow-x-auto px-(--gutter) pb-2 md:hidden"
        >
          {images.map((image, i) => (
            <li key={i} className="w-[85%] shrink-0 snap-start">
              <CMSImage image={image} ratio="4/5" sizes="85vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
