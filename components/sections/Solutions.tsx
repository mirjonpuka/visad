import { getTranslations } from "next-intl/server";
import { CMSImage } from "@/components/media/CMSImage";
import { ImageWipe, Reveal, SplitHeadline } from "@/components/motion/reveals";
import { Link } from "@/i18n/navigation";
import type { NavItem } from "@/lib/site-data";

/**
 * "Për kë punojmë" (UI §3.6): 4 cards (laptop), 2×2 (tablet), 1 column
 * (phone). Card: 4:5 image, title, one line, "Mëso më shumë →". Hover: image
 * 1.04, card lifts 4px, arrow moves (Motion §5.5).
 */
export async function Solutions({ title, solutions }: { title?: string | null; solutions: NavItem[] }) {
  const t = await getTranslations();
  if (!solutions.length) return null;

  return (
    <section id="zgjidhje" className="surface-light border-t border-line-light section-y">
      <div className="site-container">
        <header className="mb-14">
          <Reveal as="p" y={12} className="font-mono text-eyebrow text-(--surface-fg-3) uppercase">
            {t("home.solutionsEyebrow")}
          </Reveal>
          {title && (
            <SplitHeadline as="h2" className="mt-5 text-h2">
              {title}
            </SplitHeadline>
          )}
        </header>

        <ul className="grid grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 laptop:grid-cols-4">
          {solutions.map((solution, i) => (
            <li key={solution.id}>
              <Link
                href={{ pathname: "/zgjidhje/[segment]", params: { segment: solution.slug } }}
                className="group block transition-transform duration-(--dur-l) ease-out-expo hover:-translate-y-1"
              >
                <ImageWipe index={i} className="overflow-hidden rounded-base">
                  <CMSImage
                    image={solution.image}
                    ratio="4/5"
                    sizes="(min-width: 1200px) 320px, (min-width: 768px) 45vw, 90vw"
                    imgClassName="transition-transform duration-(--dur-l) ease-out-expo group-hover:scale-[1.04]"
                  />
                </ImageWipe>
                <h3 className="mt-5 text-h4">{solution.title}</h3>
                {solution.text && <p className="mt-1.5 text-body-s text-(--surface-fg-2)">{solution.text}</p>}
                <span className="link-arrow mt-4 text-body-s font-medium">
                  <span>{t("cta.learnMore")}</span>
                  <span className="link-arrow__arrow" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
