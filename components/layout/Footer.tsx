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
    // The WhatsApp FAB hides while the bottom bar is visible (B2), so no extra bottom padding
    <footer className="border-t border-line-dark bg-ink-950 pt-[72px] text-text-on-dark">
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
            {/* ALUMIL partner badge (UI §2.4): official logo, transparent PNG (owner request), never recoloured */}
            <div className="flex flex-col items-start gap-2">
              <AlumilLogo cmsLogo={site.alumilLogo} width={132} />
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
            {/* No solutions index page: "Zgjidhje" opens the 4 solution pages (A3 — it used to
                jump to the homepage section) */}
            <li>
              <details className="group">
                <summary
                  className={`${linkClass} cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden`}
                >
                  {t("nav.solutions")}
                  <span aria-hidden className="text-[12px] transition-transform duration-(--dur-s) group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <ul className="mt-1 mb-2 flex flex-col gap-1 border-l border-line-dark pl-4">
                  {site.solutions.map((s) => (
                    <li key={s.id}>
                      <Link href={{ pathname: "/zgjidhje/[segment]", params: { segment: s.slug } }} className={linkClass}>
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
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

          {/* Owner brief B3: "Adresa: …", "Tel: …" ×2, "E-mail: …" ×2 — linked */}
          <Column title={t("footer.contact")}>
            <li>
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <span>
                  <span className="text-text-on-dark-3">{t("footer.addressLabel")}:</span> {site.address}
                </span>
              </a>
            </li>
            {site.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className={linkClass}>
                  <span>
                    <span className="text-text-on-dark-3">{t("footer.phoneLabel")}:</span>{" "}
                    <span className="tabular">{p.display}</span>
                  </span>
                </a>
              </li>
            ))}
            {site.emails.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className={`${linkClass} break-all`}>
                  <span>
                    <span className="text-text-on-dark-3">{t("footer.emailLabel")}:</span> {email}
                  </span>
                </a>
              </li>
            ))}
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

      </div>

      {/* Bottom bar (owner brief B3): hairline edge to edge; © · credit · languages */}
      <div data-footer-bottom="" className="mt-16 border-t border-line-dark">
        <div className="site-container flex flex-col items-start gap-4 py-6 md:flex-row md:items-center md:gap-8">
          <p className="font-mono text-label text-text-on-dark-3 uppercase">{t("footer.copyright", { year })}</p>
          <a
            href="https://ridgeabove.com/"
            target="_blank"
            rel="noopener"
            className="font-mono text-label text-text-on-dark-3 uppercase transition-colors duration-(--dur-s) hover:text-text-on-dark"
          >
            {t("footer.credit")}
          </a>
          <LanguageSwitcher className="md:ml-auto" />
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
