/**
 * Static site data used until Sanity is wired up (Phase 3). Values come from
 * 01_PROJECT_BRIEF.md, 08_CONTENT.md and 09_ASSETS.md. Text is { sq, en };
 * other locales fall back to en (Architecture §3).
 */
import { localImage, stockImage, type SiteImage } from "./images";

type L10n = { sq: string; en: string; it?: string; de?: string };

/** Cookie banner is built but off at launch (DECISIONS D1.37). */
export const COOKIE_BANNER_ENABLED = false;

export const contact = {
  companyName: "VISAD Construction",
  address: {
    sq: "Rr. Shkodër–Koplik, km 10, Shkodër 4301",
    en: "Shkodër–Koplik road, km 10, Shkodër 4301, Albania",
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=VISAD+Construction+Shkod%C3%ABr+Koplik",
  phones: [
    { display: "+355 67 377 2989", tel: "+355673772989" },
    { display: "+355 67 255 9898", tel: "+355672559898" },
  ],
  email: "info@visad.al",
  whatsappNumber: "355673772989",
  /** [TO CONFIRM] opening hours */
  openingHours: [] as { days: L10n; hours: string }[],
  /** [TO CONFIRM] social links */
  social: [] as { platform: "facebook" | "instagram"; url: string }[],
};

export type MenuItem = {
  slug: L10n;
  title: L10n;
  text: L10n;
  image: SiteImage | null;
  placeholderNote?: string;
};

// Order = accordion / menu order (UI §1)
export const systems: MenuItem[] = [
  {
    slug: { sq: "dyer", en: "doors" },
    title: { sq: "Dyer", en: "Doors" },
    text: {
      sq: "Dyer hyrëse dhe të brendshme alumini me profile të holla, izolim termik dhe siguri të lartë.",
      en: "Aluminium entrance and interior doors with slim profiles, thermal insulation and high security.",
    },
    image: stockImage("stock-system-doors"),
  },
  {
    slug: { sq: "dritare", en: "windows" },
    title: { sq: "Dritare", en: "Windows" },
    text: {
      sq: "Dritare alumini dhe PVC me linja të holla, hapje të brendshme dhe të jashtme, për çdo lloj ndërtese.",
      en: "Aluminium and PVC windows with slim sightlines and inward or outward opening, for any building.",
    },
    image: localImage("window-pvc-historic-facade", "wide-16x10"),
  },
  {
    slug: { sq: "sisteme-rreshqitese", en: "sliding-systems" },
    title: { sq: "Sisteme rrëshqitëse", en: "Sliding systems" },
    text: {
      sq: "Dyer rrëshqitëse dhe palosëse me panele të mëdha xhami, lëvizje të lehtë dhe opsion rrjete kundër insekteve.",
      en: "Sliding and folding doors with large glass panels, smooth movement and optional insect screens.",
    },
    image: localImage("installation-folding-doors", "wide-16x10"),
  },
  {
    slug: { sq: "grila", en: "shutters" },
    title: { sq: "Grila", en: "Shutters" },
    text: {
      sq: "Grila alumini dhe PVC për izolim termik, akustik dhe vizual, të prodhuara sipas masës.",
      en: "Aluminium and PVC shutters for thermal, acoustic and visual insulation, made to measure.",
    },
    image: localImage("project-villa-glass-balconies-shutters", "wide-16x10"),
  },
  {
    slug: { sq: "ballkone-parmake", en: "balconies-railings" },
    title: { sq: "Ballkone & parmakë", en: "Balconies & railings" },
    text: {
      sq: "Parmakë xhami, alumini dhe inoksi për ballkone e shkallë, me materiale jetëgjata dhe të sigurta.",
      en: "Glass, aluminium and stainless-steel railings for balconies and stairs, durable and safe.",
    },
    image: localImage("railing-stainless-steel-balcony", "wide-16x10"),
  },
  {
    slug: { sq: "fasada", en: "facades" },
    title: { sq: "Fasada", en: "Façades" },
    text: {
      sq: "Fasada xhami dhe alumini për ndërtesa banimi dhe komerciale, nga projektimi deri te montimi.",
      en: "Glass and aluminium façades for residential and commercial buildings, from design to installation.",
    },
    image: stockImage("stock-system-facades"),
  },
];

export const solutions: MenuItem[] = [
  {
    slug: { sq: "pronare-shtepish", en: "homeowners" },
    title: { sq: "Pronarë shtëpish", en: "Homeowners" },
    text: {
      sq: "Dritare dhe dyer për shtëpinë tuaj, me matje dhe montim nga ne.",
      en: "Windows and doors for your home, measured and fitted by us.",
    },
    image: localImage("project-house-glass-railings", "wide-16x10"),
  },
  {
    slug: { sq: "zhvillues-ndertues", en: "developers" },
    title: { sq: "Zhvillues & ndërtues", en: "Developers & builders" },
    text: {
      sq: "Kapacitet prodhimi për pallate të tëra, me afate të qarta.",
      en: "Production capacity for whole buildings, with clear deadlines.",
    },
    image: localImage("project-residential-blocks-balconies", "wide-16x10"),
  },
  {
    slug: { sq: "hotele-turizem", en: "hotels" },
    title: { sq: "Hotele & turizëm", en: "Hotels & tourism" },
    text: {
      sq: "Sisteme rrëshqitëse dhe ballkone që hapin pamjen.",
      en: "Sliding systems and balconies that open up the view.",
    },
    image: localImage("project-fishta-hotel-glass-balconies", "wide-16x10"),
  },
  {
    slug: { sq: "arkitekte-tendera", en: "architects" },
    title: { sq: "Arkitektë & tendera", en: "Architects & tenders" },
    text: {
      sq: "Fleta teknike, detaje dhe ofertë për tendera publike.",
      en: "Datasheets, details and bids for public tenders.",
    },
    image: stockImage("stock-solution-architects"),
  },
];

export const megaIntro = {
  systems: {
    sq: "Sisteme alumini dhe PVC, të prodhuara në Shkodër.",
    en: "Aluminium and PVC systems, made in Shkodër.",
  },
  solutions: { sq: "Për kë punojmë.", en: "Who we work for." },
} satisfies Record<string, L10n>;

export function t10n(value: L10n, locale: string): string {
  return value[locale as keyof L10n] ?? value.en ?? value.sq;
}
