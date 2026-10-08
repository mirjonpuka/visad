import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HeroUnderNav } from "@/components/layout/LayoutUIProvider";
import { ContactForms } from "@/components/forms/ContactForms";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { SplitHeadline } from "@/components/motion/reveals";
import { MapVisit } from "@/components/sections/MapVisit";
import { getFormConfig } from "@/lib/forms/config";
import { SYSTEM_KEYS } from "@/lib/forms/schemas";
import { getSiteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import { whatsappHref } from "@/lib/whatsapp";
import { sanityFetch } from "@/sanity/lib/fetch";
import { defineQuery } from "next-sanity";

const CONTACT_QUERY = defineQuery(`*[_id == "pageSettings"][0]{
  "lead": coalesce(contactLead[language == $locale][0].value, contactLead[language == "en"][0].value, contactLead[language == "sq"][0].value)
}`);

async function getLead() {
  const data = await sanityFetch<{ lead?: string | null } | null>({ query: CONTACT_QUERY, tags: ["pages"] });
  return data?.lead ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale, lead] = await Promise.all([getTranslations(), getLocale(), getLead()]);
  return pageMetadata({ locale, pathname: "/kontakt", title: t("contact.title"), description: lead });
}

/** Contact & quote (UI §11): quick contact cards, tabbed forms, map & hours. No CTA band. */
export default async function ContactPage() {
  const t = await getTranslations();
  const [site, lead] = await Promise.all([getSiteData(), getLead()]);
  const systems = SYSTEM_KEYS.map((key) => {
    const item = site.systems.find((s) => s.slugs?.some((x) => x.language === "sq" && x.slug === key));
    return { key, title: item?.title ?? key };
  });

  const card = "flex min-h-[180px] flex-col gap-4 rounded-base border p-6 transition-colors md:p-8";

  return (
    <>
      <HeroMotion className="surface-dark pt-(--navbar-h)">
        <HeroUnderNav />
        <div className="site-container pt-12 pb-16 md:pt-20 md:pb-24">
          <div data-hero-fade="">
            <Breadcrumbs items={[{ label: t("contact.title") }]} />
          </div>
          <SplitHeadline as="h1" trigger="manual" className="mt-8 text-display-l">
            {t("contact.title")}
          </SplitHeadline>
          {lead && (
            <p data-hero-fade="" className="mt-6 max-w-[560px] text-body-l text-text-on-dark-2">
              {lead}
            </p>
          )}

          <ul data-hero-fade="" className="mt-14 grid gap-4 md:grid-cols-3" aria-label={t("contact.quickLabel")}>
            <li>
              <a
                href={whatsappHref(site.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${card} group h-full border-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20`}
              >
                <MessageCircle size={28} strokeWidth={1.5} aria-hidden className="text-[#25D366]" />
                <span className="text-h4">{t("cta.whatsapp")}</span>
                <span className="text-body-s text-text-on-dark-2">{t("contact.whatsappText")}</span>
              </a>
            </li>
            <li className={`${card} border-line-dark`}>
              <Phone size={28} strokeWidth={1.5} aria-hidden className="text-text-on-dark-2" />
              <span className="text-h4">{t("contact.phone")}</span>
              <ul className="flex flex-col gap-1">
                {site.phones.map((p) => (
                  <li key={p.tel}>
                    <a href={`tel:${p.tel}`} className="inline-flex min-h-11 items-center font-mono text-body tabular underline-offset-4 hover:underline">
                      {p.display}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={`${card} h-full border-line-dark hover:border-text-on-dark-3`}>
                <Mail size={28} strokeWidth={1.5} aria-hidden className="text-text-on-dark-2" />
                <span className="text-h4">{t("contact.email")}</span>
                <span className="font-mono text-body text-text-on-dark-2">{site.email}</span>
              </a>
            </li>
          </ul>
        </div>
      </HeroMotion>

      <section id="formulari" className="surface-light scroll-mt-24 section-y">
        <div className="site-container">
          <div className="mx-auto max-w-[880px]">
            <ContactForms config={getFormConfig()} systems={systems} />
          </div>
        </div>
      </section>

      <MapVisit
        title={t("contact.visit")}
        address={site.address}
        hours={site.openingHours}
        mapsUrl={site.mapsUrl}
        embedQuery={`VISAD Construction, ${site.address}`}
        labels={{
          address: t("factory.address"),
          hours: t("footer.hours"),
          directions: t("factory.directions"),
          loadMap: t("factory.loadMap"),
          mapNote: t("factory.mapNote"),
          mapTitle: t("factory.mapTitle"),
        }}
      />
    </>
  );
}
