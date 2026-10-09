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

function Column({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="mb-5 font-mono text-eyebrow text-text-on-dark-3 uppercase">{title}</h2>
      <ul className="flex flex-col gap-1 text-body-s">{children}</ul>
    </div>
  );
}

const linkClass =
  "inline-flex min-h-8 items-center text-text-on-dark-2 transition-colors duration-(--dur-s) ease-standard hover:text-text-on-dark";

/** Footer (UI §2.4): ink-950, 4 columns (laptop) / 2 (tablet); phone: Systems and Company side by side (owner). */
export async function Footer() {
  const t = await getTranslations();
  const year = await currentYear();
  const site = await getSiteData();

  return (
    // The WhatsApp FAB hides while the bottom bar is visible (B2), so no extra bottom padding
    <footer className="border-t border-line-dark bg-ink-950 pt-[72px] text-text-on-dark">
      <div className="site-container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 laptop:grid-cols-4 laptop:gap-5">
          <div className="col-span-2 flex flex-col gap-5 md:col-span-1 laptop:pr-8">
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
                  <span
                    aria-hidden
                    className="text-[12px] transition-transform duration-(--dur-s) group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <ul className="mt-1 mb-2 flex flex-col gap-1 border-l border-line-dark pl-4">
                  {site.solutions.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={{ pathname: "/zgjidhje/[segment]", params: { segment: s.slug } }}
                        className={linkClass}
                      >
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
          <Column title={t("footer.contact")} className="col-span-2 md:col-span-1">
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

      {/* Bottom bar: hairline edge to edge. Laptop: © · Ridge badge (centre) · languages.
          Phone: © and languages on the left, the badge in the bottom-right corner (owner). */}
      <div data-footer-bottom="" className="mt-16 border-t border-line-dark">
        <div className="site-container grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-3 py-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <p className="font-mono text-label text-text-on-dark-3 uppercase">
            {t("footer.copyright", { year })}
          </p>
          {/* Site credit (owner): their pill badge. Muted at rest, brighter on hover/focus: colour,
              opacity, border, background and glow only. It never moves (no transform anywhere). */}
          <a
            href="https://ridgeabove.com/"
            target="_blank"
            rel="noopener"
            aria-label={t("footer.credit")}
            className="group ease-out relative col-start-2 row-span-2 row-start-1 inline-flex h-[41px] w-[150px] self-end rounded-full border border-transparent transition-[border-color,background-color,box-shadow] duration-250 hover:border-white/35 hover:bg-white/6 hover:shadow-[0_0_24px_rgba(255,255,255,0.08)] focus-visible:border-white/35 focus-visible:bg-white/6 focus-visible:shadow-[0_0_24px_rgba(255,255,255,0.08)] md:row-span-1 md:self-center"
          >
            {/* -inset-px: the image's own pill edge sits exactly under the hover border */}
            <span className="absolute -inset-px">
              <Image
                src="/brand/partners/powered-by-ridge.png"
                alt=""
                fill
                sizes="150px"
                className="ease-out object-contain opacity-70 transition-opacity duration-250 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
            </span>
          </a>
          <LanguageSwitcher className="md:col-start-3 md:justify-self-end" />
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
