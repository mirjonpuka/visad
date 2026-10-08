import { getTranslations } from "next-intl/server";
import { FooterCta } from "@/components/layout/Footer";
import { HeroUnderNav } from "@/components/layout/LayoutUIProvider";
import { SwooshLine } from "@/components/motion/SwooshLine";
import { LinkArrow } from "@/components/ui/LinkArrow";

/** 404 (UI §12): dark, huge Mono "404", h1, three links; the logo swoosh draws across. */
export default async function NotFound() {
  const t = await getTranslations();
  return (
    <>
      <section className="surface-dark relative isolate flex min-h-svh items-center overflow-hidden pt-(--navbar-h)">
        <HeroUnderNav />
        <SwooshLine mode="draw" opacity={0.55} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="site-container section-y">
          <p
            aria-hidden
            className="font-mono text-[clamp(96px,18vw,240px)] leading-none tracking-[-0.04em] text-text-on-dark-3"
          >
            404
          </p>
          <h1 className="mt-8 text-h2">{t("notFound")}</h1>
          <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <li>
              <LinkArrow href="/">{t("breadcrumb.home")}</LinkArrow>
            </li>
            <li>
              <LinkArrow href="/projektet">{t("nav.projects")}</LinkArrow>
            </li>
            <li>
              <LinkArrow href="/kontakt">{t("nav.contact")}</LinkArrow>
            </li>
          </ul>
        </div>
      </section>
      <FooterCta />
    </>
  );
}
