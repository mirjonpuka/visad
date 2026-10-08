import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { devRoutesEnabled } from "@/lib/dev";

// Temporary placeholder until the Home page is built in Phase 4.
export default async function HomePage() {
  const t = await getTranslations();
  return (
    <main className="surface-dark flex min-h-svh flex-col justify-end section-y-xl">
      <div className="site-container">
        <Image
          src="/brand/logo/visad-logo-on-dark.svg"
          alt="VISAD Construction"
          width={280}
          height={109}
          className="mb-16 h-auto w-[180px] md:w-[280px]"
          loading="eager"
        />
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
    </main>
  );
}
