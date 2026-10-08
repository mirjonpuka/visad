import { getTranslations } from "next-intl/server";
import { AlumilLogo } from "@/components/ui/AlumilLogo";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { SiteImage } from "@/lib/images";

/** ALUMIL partner band (UI §3.7) on alu-100: logo (260×120 box) · text · "Certifikatat →". */
export async function AlumilBand({ text, logo }: { text: string | null; logo: SiteImage | null }) {
  const t = await getTranslations("home");

  return (
    <section className="surface-light bg-alu-100 py-[72px]">
      <div className="site-container flex flex-col gap-10 laptop:flex-row laptop:items-center laptop:gap-16">
        <div className="flex h-[120px] w-[260px] shrink-0 items-center">
          <AlumilLogo cmsLogo={logo} width={220} />
        </div>
        <div className="flex-1">
          <h2 className="text-h3">{t("alumilTitle")}</h2>
          {/* Thin red line under the heading (draws in Phase 5) */}
          <span aria-hidden className="mt-4 block h-px w-16 bg-red-500" />
          {text && <p className="mt-5 max-w-[620px] text-body text-text-on-light-2">{text}</p>}
        </div>
        <LinkArrow
          href={{ pathname: "/fabrika", hash: "certifikata" }}
          className="shrink-0 self-start laptop:self-center"
        >
          {t("certificates")}
        </LinkArrow>
      </div>
    </section>
  );
}
