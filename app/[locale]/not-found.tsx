import { getTranslations } from "next-intl/server";
import { FooterCta } from "@/components/layout/Footer";
import { LinkArrow } from "@/components/ui/LinkArrow";

// Basic 404 (UI §12). The swoosh animation is added in Phase 7.
export default async function NotFound() {
  const t = await getTranslations();
  return (
    <>
      <section className="surface-dark pt-(--navbar-h)">
        <div className="site-container section-y-xl">
          <p className="font-mono text-[clamp(96px,18vw,240px)] leading-none tracking-[-0.04em] text-text-on-dark-3">
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
