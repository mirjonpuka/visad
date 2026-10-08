import { getTranslations } from "next-intl/server";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Reveal, SplitHeadline } from "@/components/motion/reveals";
import { SwooshLine } from "@/components/motion/SwooshLine";
import { ButtonSecondary } from "@/components/ui/Button";

/**
 * Closing CTA (UI §3.8): display-l headline + lead left, WhatsApp + quote
 * form right. Behind it the logo swoosh as a huge 1px line at 20% opacity,
 * drawing itself as the section scrolls through (Motion §4.8).
 * Used at the end of most pages.
 */
export async function CtaBand({ title, text }: { title?: string | null; text?: string | null }) {
  const t = await getTranslations();

  return (
    <section id="kontakt" className="surface-dark relative isolate overflow-hidden section-y-xl">
      <SwooshLine className="absolute inset-0 -z-10 h-full w-full" />

      <div className="site-container flex flex-col gap-10 laptop:flex-row laptop:items-end laptop:justify-between laptop:gap-16">
        <div className="max-w-[880px]">
          <SplitHeadline as="h2" className="text-display-l text-balance">
            {title ?? t("footer.ctaTitle")}
          </SplitHeadline>
          {text && (
            <Reveal as="p" delay={0.2} className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">
              {text}
            </Reveal>
          )}
        </div>
        <Reveal stagger delay={0.3} className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <WhatsAppButton className="w-full sm:w-auto" />
          <ButtonSecondary size="lg" href="/kontakt" className="w-full sm:w-auto">
            {t("cta.quoteForm")}
          </ButtonSecondary>
        </Reveal>
      </div>
    </section>
  );
}
