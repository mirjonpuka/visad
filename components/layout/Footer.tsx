import type { ReactNode } from "react";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { AlumilLogo } from "@/components/ui/AlumilLogo";
import { ButtonSecondary } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getSiteData } from "@/lib/site-data";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppButton } from "./WhatsAppButton";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-5 font-mono text-eyebrow text-text-on-dark-3 uppercase">{title}</h2>
      <ul className="flex flex-col gap-1 text-body-s">{children}</ul>
    </div>
  );
}

const linkClass =
  "inline-flex min-h-8 items-center text-text-on-dark-2 transition-colors duration-(--dur-s) ease-standard hover:text-text-on-dark";

/** Footer (UI §2.4): ink-950, 4 columns (laptop) / 2 (tablet) / 1 (phone). */
export async function Footer() {
  const t = await getTranslations();
  const year = await currentYear();
  const site = await getSiteData();

  return (
    // Bottom padding keeps the last row clear of the WhatsApp FAB (56px + gap)
    <footer className="border-t border-line-dark bg-ink-950 pt-[72px] pb-[calc(56px+var(--fab-gap)+24px)] text-text-on-dark">
      <div className="site-container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 laptop:grid-cols-4 laptop:gap-5">
          <div className="flex flex-col gap-5 laptop:pr-8">
            <Link href="/" aria-label={t("nav.home")} className="self-start">
              <Image
                src="/brand/logo/visad-logo-on-dark.svg"
                alt=""
                width={140}
                height={55}
                className="h-auto w-[140px]"
              />
            </Link>
            <p className="max-w-[300px] text-body-s text-text-on-dark-2">{t("footer.about")}</p>
            {/* ALUMIL partner badge (UI §2.4): official logo on a light tile, never recoloured */}
            <div className="flex flex-col items-start gap-2">
              <AlumilLogo cmsLogo={site.alumilLogo} width={120} tile />
              <span className="font-mono text-label text-text-on-dark-3 uppercase">{t("footer.alumil")}</span>
            </div>
          </div>

          <Column title={t("footer.systems")}>
            {site.systems.map((s) => (
              <li key={s.id}>
                <Link href={{ pathname: "/sistemet/[slug]", params: { slug: s.slug } }} className={linkClass}>
                  {s.title}
                </Link>
              </li>
            ))}
          </Column>

          <Column title={t("footer.company")}>
            <li>
              <Link href="/projektet" className={linkClass}>
                {t("nav.projects")}
              </Link>
            </li>
            <li>
              <Link href="/fabrika" className={linkClass}>
                {t("nav.factory")}
              </Link>
            </li>
            <li>
              <Link href={{ pathname: "/", hash: "zgjidhje" }} className={linkClass}>
                {t("nav.solutions")}
              </Link>
            </li>
            <li>
              <Link href="/karriera" className={linkClass}>
                {t("nav.careers")}
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className={linkClass}>
                {t("nav.contact")}
              </Link>
            </li>
            <li>
              <Link href="/privatesia" className={linkClass}>
                {t("footer.privacy")}
              </Link>
            </li>
          </Column>

          <Column title={t("footer.contact")}>
            <li>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {site.address}
              </a>
            </li>
            {site.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className={`${linkClass} tabular`}>
                  {p.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
            <li className="mt-3 text-text-on-dark-3">
              <span className="font-mono text-label uppercase">{t("footer.hours")}</span>
              {site.openingHours.length ? (
                site.openingHours.map((h) => (
                  <span key={h.days + h.hours} className="block text-text-on-dark-2">
                    {h.days} · {h.hours}
                  </span>
                ))
              ) : (
                <span className="block text-text-on-dark-2">[TO CONFIRM]</span>
              )}
            </li>
            {site.social.length > 0 && (
              <li className="mt-3 flex gap-4">
                {site.social.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-mono text-label text-text-on-dark-2 uppercase hover:text-text-on-dark"
                  >
                    {s.platform}
                  </a>
                ))}
              </li>
            )}
          </Column>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start gap-4 border-t border-line-dark pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-label text-text-on-dark-3 uppercase">
            {t("footer.copyright", { year })}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}

/**
 * "Keni një projekt?" row (UI §2.4), for pages that do not end with the CTA
 * section (Careers, Privacy, 404). Render it as the page's last element.
 */
export async function FooterCta() {
  const t = await getTranslations();
  return (
    <section className="border-t border-line-dark bg-ink-950 pt-[72px]">
      <div className="site-container flex flex-col gap-8 laptop:flex-row laptop:items-end laptop:justify-between">
        <h2 className="text-h2">{t("footer.ctaTitle")}</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton />
          <ButtonSecondary size="lg" href="/kontakt">
            {t("cta.quoteForm")}
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
}
