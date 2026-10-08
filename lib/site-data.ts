import "server-only";
import type { SiteImage } from "./images";
import { sanityFetch } from "@/sanity/lib/fetch";
import { LAYOUT_QUERY } from "@/sanity/lib/queries";
import { toSiteImage, type LayoutData, type Slugs } from "@/sanity/lib/types";

/** Menu entry, already localized (navbar, mega-menus, mobile menu, footer) */
export type NavItem = {
  id: string;
  title: string;
  slug: string;
  slugs: Slugs;
  text: string;
  image: SiteImage | null;
};

/** Site-wide data from Sanity, serializable for client components */
export type SiteData = {
  companyName: string;
  address: string;
  /** Map pin (Cilësimet → Vendndodhja në hartë); null until set */
  geo: { lat: number; lng: number } | null;
  mapsUrl: string;
  phones: { display: string; tel: string }[];
  email: string;
  whatsappNumber: string;
  /** Prefilled message with {page} placeholder, or null to use the UI default */
  whatsappMessage: string | null;
  openingHours: { days: string; hours: string }[];
  social: { platform: string; url: string }[];
  alumilText: string | null;
  /** Logo uploaded in Sanity (Cilësimet → Partner ALUMIL); null = use the bundled file */
  alumilLogo: SiteImage | null;
  systems: NavItem[];
  solutions: NavItem[];
};

const FALLBACK_WHATSAPP = "355673772989";

/** Layout data for the current locale; cached + tagged (settings, system, solution). */
export async function getSiteData(): Promise<SiteData> {
  const data = await sanityFetch<LayoutData>({
    query: LAYOUT_QUERY,
    tags: ["settings", "system", "solution"],
  });
  const s = data.settings ?? {};
  const address = s.address ?? "";
  const mapsQuery = s.geo ? `${s.geo.lat},${s.geo.lng}` : `VISAD Construction ${address}`;

  return {
    companyName: s.companyName ?? "VISAD Construction",
    address,
    geo: s.geo ? { lat: s.geo.lat, lng: s.geo.lng } : null,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
    phones: (s.phones ?? []).map((p) => ({ display: p.number, tel: p.number.replace(/[^\d+]/g, "") })),
    email: s.email ?? "info@visad.al",
    whatsappNumber: s.whatsappNumber || FALLBACK_WHATSAPP,
    whatsappMessage: s.whatsappMessage ?? null,
    openingHours: (s.openingHours ?? []).filter((h) => h.days && h.hours) as SiteData["openingHours"],
    social: (s.social ?? []).filter((x) => x.platform && x.url),
    alumilText: s.alumilText ?? null,
    alumilLogo: toSiteImage(s.alumilLogo ?? null),
    systems: data.systems.map((x) => ({
      id: x._id,
      title: x.title,
      slug: x.slug,
      slugs: x.slugs,
      text: x.text,
      image: toSiteImage(x.thumbnail),
    })),
    solutions: data.solutions.map((x) => ({
      id: x._id,
      title: x.title,
      slug: x.slug,
      slugs: x.slugs,
      text: x.text ?? "",
      image: toSiteImage(x.image),
    })),
  };
}
