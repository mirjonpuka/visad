import { getTranslations } from "next-intl/server";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ButtonSecondary } from "@/components/ui/Button";

/** The logo's S-swoosh centre line (brand/logo/visad-logo-*.svg) */
const SWOOSH_PATH = "M-20 460H430Q482 460 505 400L615 110Q642 40 700 40H1300";

/**
 * Closing CTA (UI §3.8): display-l headline + lead left, WhatsApp + quote
 * form right. The swoosh is drawn as a huge 1px line at 20% opacity behind
 * it; it draws itself on scroll in Phase 5. Used at the end of most pages.
 */
export async function CtaBand({ title, text }: { title?: string | null; text?: string | null }) {
  const t = await getTranslations();

  return (
    <section id="kontakt" className="surface-dark relative isolate overflow-hidden section-y-xl">
      <svg
        aria-hidden
        viewBox="0 0 1280 500"
        preserveAspectRatio="none"
        className="absolute inset-0 -z-10 h-full w-full"
      >
        <path
          d={SWOOSH_PATH}
          fill="none"
          stroke="var(--color-red-500)"
          strokeOpacity="0.2"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="site-container flex flex-col gap-10 laptop:flex-row laptop:items-end laptop:justify-between laptop:gap-16">
        <div className="max-w-[880px]">
          <h2 className="text-display-l text-balance">{title ?? t("footer.ctaTitle")}</h2>
          {text && <p className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">{text}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <WhatsAppButton className="w-full sm:w-auto" />
          <ButtonSecondary size="lg" href="/kontakt" className="w-full sm:w-auto">
            {t("cta.quoteForm")}
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
}
