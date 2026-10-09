import type { SiteData } from "@/lib/site-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";

/** Inline JSON-LD; `<` escaped so CMS text can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * HomeAndConstructionBusiness on every page (Architecture §8), the same
 * name / address / phone as the Google Business Profile. Opening hours and
 * map pin are added once confirmed in the CMS.
 */
export function BusinessJsonLd({ site, locale }: { site: SiteData; locale: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "@id": `${SITE_URL}/#business`,
        name: site.companyName,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo/visad-logo-on-light.svg`,
        image: `${SITE_URL}/brand/logo/visad-logo-on-light.svg`,
        email: site.emails.length > 1 ? site.emails : site.emails[0],
        telephone: site.phones.map((p) => p.tel),
        inLanguage: locale,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rr. Shkodër–Koplik, km 10",
          addressLocality: "Shkodër",
          postalCode: "4301",
          addressCountry: "AL",
        },
        ...(site.geo ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
        ...(site.openingHours.length
          ? { openingHours: site.openingHours.map((h) => `${h.days} ${h.hours}`) }
          : {}),
        ...(site.social.length ? { sameAs: site.social.map((s) => s.url) } : {}),
        hasMap: site.mapsUrl,
      }}
    />
  );
}
