import { getTranslations } from "next-intl/server";
import { LinkArrow } from "@/components/ui/LinkArrow";

/**
 * ALUMIL partner band (UI §3.7) on alu-100. The official partner logo goes in
 * the 260×120 box once the client sends the ALUMIL partner kit; until then the
 * box says so (the ALUMIL logo is never imitated).
 */
export async function AlumilBand({ text }: { text: string | null }) {
  const t = await getTranslations("home");

  return (
    <section className="surface-light bg-alu-100 py-[72px]">
      <div className="site-container flex flex-col gap-10 laptop:flex-row laptop:items-center laptop:gap-16">
        <div className="flex h-[120px] w-[260px] shrink-0 items-center justify-center rounded-base border border-line-light px-6 text-center">
          <span className="font-mono text-[10px] tracking-[0.06em] text-text-on-light-3 uppercase">
            {t("alumilLogo")}
          </span>
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
