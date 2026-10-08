import { getTranslations } from "next-intl/server";
import { HeroUnderNav } from "@/components/layout/LayoutUIProvider";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { devRoutesEnabled } from "@/lib/dev";

// Temporary placeholder until the Home page is built in Phase 4.
export default async function HomePage() {
  const t = await getTranslations();
  return (
    <>
      <HeroUnderNav />
      <section className="surface-dark flex min-h-svh flex-col justify-end section-y-xl">
        <div className="site-container">
          <p className="mb-6 font-mono text-eyebrow text-text-on-dark-2 uppercase">
            Partner i certifikuar ALUMIL · Shkodër
          </p>
          <h1 className="max-w-[1000px] text-display-xl">
            Precizion në
            <br />
            çdo profil.
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonPrimary size="lg" arrow href="/kontakt">
              {t("cta.quote")}
            </ButtonPrimary>
            {devRoutesEnabled && (
              <ButtonSecondary size="lg" href="/dev/kit">
                UI kit (dev)
              </ButtonSecondary>
            )}
          </div>
        </div>
      </section>
      {/* Spacer so hide-on-scroll can be tried before Phase 4 */}
      <section className="surface-light section-y">
        <div className="site-container min-h-[120vh]">
          <p className="font-mono text-eyebrow text-(--surface-fg-3) uppercase">Phase 4 · Home sections</p>
        </div>
      </section>
    </>
  );
}
