/**
 * Seeds the Sanity "production" dataset (CMS §6).
 *
 *   npm run seed            create documents that don't exist yet (safe to re-run)
 *   npm run seed -- --force replace the seeded documents (overwrites Studio edits!)
 *
 * Images: real Visad photos are uploaded from the edited JPG masters in
 * _handoff/images/edited (DECISIONS C4; Sanity serves them as AVIF/WebP).
 * Temporary stock photos come from public/images/stock and are flagged
 * isPlaceholder with their "will be replaced with …" note.
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient, type SanityDocumentStub } from "@sanity/client";
import { contact, solutions, systems } from "../lib/site";

const FORCE = process.argv.includes("--force");
const root = process.cwd();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-02-19",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("Missing SANITY_API_WRITE_TOKEN in .env.local");

// ---------------------------------------------------------------------------
// i18n value helpers (internationalized-array v5 shape)
// ---------------------------------------------------------------------------

type T = { sq: string; en?: string };
type Lang = "sq" | "en";

function i18n(kind: "String" | "Text", value: T) {
  return (Object.entries(value) as [Lang, string][])
    .filter(([, v]) => v)
    .map(([language, v]) => ({
      _key: language,
      _type: `internationalizedArray${kind}Value`,
      language,
      value: v,
    }));
}
const str = (value: T) => i18n("String", value);
const text = (value: T) => i18n("Text", value);

function slugs(value: T) {
  return (Object.entries(value) as [Lang, string][]).map(([language, current]) => ({
    _key: language,
    _type: "internationalizedArraySlugValue",
    language,
    value: { _type: "slug", current },
  }));
}

function blocks(value: T) {
  return (Object.entries(value) as [Lang, string][]).map(([language, paragraph]) => ({
    _key: language,
    _type: "internationalizedArrayBlockContentValue",
    language,
    value: paragraph.split("\n\n").map((p, i) => ({
      _type: "block",
      _key: `${language}${i}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `${language}${i}s`, text: p, marks: [] }],
    })),
  }));
}

const ref = (id: string, key?: string) => ({ _type: "reference", _ref: id, ...(key ? { _key: key } : {}) });

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

type Manifest = Record<string, { alt: T; edited?: string }>;
const handoffManifest = JSON.parse(
  readFileSync(join(root, "_handoff/images/manifest.json"), "utf8"),
) as (Manifest[string] & {
  id: string;
})[];
const stockManifest = JSON.parse(readFileSync(join(root, "lib/stock.manifest.json"), "utf8")) as Record<
  string,
  { alt: T; placeholderNote: string; credit: string; web: { src: string; width: number }[] }
>;

const assetIds = new Map<string, string>();

async function upload(key: string, path: string) {
  if (assetIds.has(key)) return assetIds.get(key)!;
  // Sanity de-duplicates identical files, so re-running never creates copies
  const asset = await client.assets.upload("image", createReadStream(path), { filename: basename(path) });
  assetIds.set(key, asset._id);
  return asset._id;
}

type ImgOptions = { hotspot?: { x: number; y: number }; key?: string };

/** Real Visad photo from the handoff (edited JPG master) */
async function photo(id: string, options: ImgOptions = {}) {
  const entry = handoffManifest.find((m) => m.id === id);
  if (!entry?.edited) throw new Error(`Unknown handoff image ${id}`);
  const assetId = await upload(id, join(root, "_handoff/images", entry.edited));
  return imageValue(assetId, entry.alt, { ...options, isPlaceholder: false });
}

/** Temporary stock photo (largest WebP), flagged as placeholder */
async function stock(id: string, options: ImgOptions = {}) {
  const entry = stockManifest[id];
  if (!entry) throw new Error(`Unknown stock image ${id}`);
  const largest = entry.web.reduce((a, b) => (b.width > a.width ? b : a));
  const assetId = await upload(id, join(root, "public", largest.src));
  return imageValue(assetId, entry.alt, {
    ...options,
    isPlaceholder: true,
    placeholderNote: entry.placeholderNote,
    credit: entry.credit,
  });
}

function imageValue(
  assetId: string,
  alt: T,
  options: ImgOptions & { isPlaceholder: boolean; placeholderNote?: string; credit?: string },
) {
  return {
    _type: "imageWithAlt",
    ...(options.key ? { _key: options.key } : {}),
    asset: { _type: "reference", _ref: assetId },
    ...(options.hotspot
      ? {
          hotspot: {
            _type: "sanity.imageHotspot",
            x: options.hotspot.x,
            y: options.hotspot.y,
            width: 1,
            height: 1,
          },
        }
      : {}),
    alt: str(alt),
    isPlaceholder: options.isPlaceholder,
    ...(options.placeholderNote ? { placeholderNote: options.placeholderNote } : {}),
    ...(options.credit ? { credit: options.credit } : {}),
  };
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

type SystemKey = "dyer" | "dritare" | "sisteme-rreshqitese" | "grila" | "ballkone-parmake" | "fasada";
const systemId = (sq: SystemKey) => `system-${sq}`;

async function buildDocuments(): Promise<SanityDocumentStub[]> {
  const docs: SanityDocumentStub[] = [];

  // --- siteSettings -------------------------------------------------------
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    companyName: contact.companyName,
    address: text(contact.address),
    phones: contact.phones.map((p, i) => ({ _key: `p${i}`, _type: "phone", number: p.display })),
    whatsappNumber: contact.whatsappNumber,
    whatsappMessage: str({
      sq: "Përshëndetje VISAD! Ju shkruaj nga faqja: {page}",
      en: "Hello VISAD! I'm writing from your website page: {page}",
    }),
    email: contact.email,
    leadEmail: contact.email,
    // [TO CONFIRM] values from the old site (TODO_CLIENT.md)
    stats: [
      {
        _key: "projects",
        _type: "stat",
        value: "9500+",
        label: str({ sq: "projekte të realizuara", en: "completed projects" }),
      },
      {
        _key: "years",
        _type: "stat",
        value: "16+",
        label: str({ sq: "vite përvojë", en: "years of experience" }),
      },
      {
        _key: "countries",
        _type: "stat",
        value: "5",
        label: str({ sq: "shtete me klientë", en: "countries with clients" }),
      },
    ],
    alumilPartner: {
      text: text({
        sq: "Punojmë me sistemet e ALUMIL, me performancë të testuar termike dhe akustike, dhe i prodhojmë sipas standardeve të tyre.",
        en: "We fabricate ALUMIL systems, with tested thermal and acoustic performance, to ALUMIL's standards.",
      }),
    },
  });

  // --- systems ------------------------------------------------------------
  const systemImages: Record<SystemKey, { thumb: () => Promise<object>; hero: () => Promise<object> }> = {
    dyer: { thumb: () => stock("stock-system-doors"), hero: () => stock("stock-system-doors") },
    // Real Visad photos stay on projects and company slots (owner feedback, migration 003)
    dritare: {
      thumb: () => stock("stock-system-windows"),
      hero: () => stock("stock-system-windows"),
    },
    "sisteme-rreshqitese": {
      thumb: () => stock("stock-system-sliding"),
      hero: () => stock("stock-system-sliding"),
    },
    grila: {
      thumb: () => stock("stock-system-shutters"),
      hero: () => stock("stock-system-shutters"),
    },
    "ballkone-parmake": {
      thumb: () => stock("stock-system-railings"),
      hero: () => stock("stock-system-railings"),
    },
    fasada: { thumb: () => stock("stock-system-facades"), hero: () => stock("stock-system-facades") },
  };
  for (const [index, s] of systems.entries()) {
    const sq = s.slug.sq as SystemKey;
    const images = systemImages[sq];
    const thumbnail = await images.thumb();
    docs.push({
      _id: systemId(sq),
      _type: "system",
      title: str(s.title),
      slug: slugs(s.slug),
      order: index + 1,
      shortDescription: text(s.text),
      thumbnail,
      accordionImage: thumbnail,
      heroImage: await images.hero(),
      // Specs, series, benefits: only from ALUMIL datasheets (08: "Do not invent performance numbers")
    });
  }

  // --- solutions ----------------------------------------------------------
  const solutionSetup: Record<
    string,
    { segment: string; image: () => Promise<object>; cta: string; systems: string[]; heroTitle?: T }
  > = {
    "pronare-shtepish": {
      segment: "homeowners",
      image: () => stock("stock-solution-homeowners"),
      cta: "whatsapp",
      systems: ["dyer", "dritare", "grila"],
    },
    "zhvillues-ndertues": {
      segment: "developers",
      image: () => stock("stock-solution-developers"),
      cta: "quote",
      systems: ["dritare", "ballkone-parmake", "fasada"],
    },
    "hotele-turizem": {
      segment: "hotels",
      image: () => stock("stock-solution-hotels"),
      cta: "quote",
      systems: ["sisteme-rreshqitese", "ballkone-parmake", "fasada"],
      heroTitle: {
        sq: "Për hotelet: pamje të hapura, sisteme që zgjasin.",
        en: "For hotels: open views, systems that last.",
      },
    },
    "arkitekte-tendera": {
      segment: "architects",
      image: () => stock("stock-solution-architects"),
      cta: "tender",
      systems: ["fasada", "dritare", "sisteme-rreshqitese"],
    },
  };
  for (const s of solutions) {
    const setup = solutionSetup[s.slug.sq];
    docs.push({
      _id: `solution-${setup.segment}`,
      _type: "solution",
      segment: setup.segment,
      title: str(s.title),
      slug: slugs(s.slug),
      cardText: str(s.text),
      ...(setup.heroTitle ? { heroTitle: text(setup.heroTitle) } : {}),
      heroImage: await setup.image(),
      ctaKind: setup.cta,
      recommendedSystems: setup.systems.map((id, i) => ref(systemId(id as SystemKey), `s${i}`)),
    });
  }

  // --- projects (real Visad photos only) ----------------------------------
  // Names/cities/years [TO CONFIRM] except "Fishta Hotel" (CMS §6, 09_ASSETS)
  const projects: {
    id: string;
    photo: string;
    title: T;
    slug: T;
    type: string;
    systems: SystemKey[];
    audience: string[];
    featuredOrder?: number;
  }[] = [
    {
      id: "fishta-hotel",
      photo: "project-fishta-hotel-glass-balconies",
      title: { sq: "Fishta Hotel", en: "Fishta Hotel" },
      slug: { sq: "fishta-hotel", en: "fishta-hotel" },
      type: "hotel",
      systems: ["ballkone-parmake", "dyer"],
      audience: ["hotels"],
      featuredOrder: 1,
    },
    {
      id: "shtepi-parmake-xhami",
      photo: "project-house-glass-railings",
      title: { sq: "Shtëpi me parmakë xhami [TO CONFIRM]", en: "House with glass railings [TO CONFIRM]" },
      slug: { sq: "shtepi-me-parmake-xhami", en: "house-with-glass-railings" },
      type: "villa",
      systems: ["ballkone-parmake"],
      audience: ["homeowners"],
      featuredOrder: 2,
    },
    {
      id: "shkalle-parmake-xhami",
      photo: "railing-glass-staircase",
      title: { sq: "Shkallë me parmakë xhami [TO CONFIRM]", en: "Glass staircase railing [TO CONFIRM]" },
      slug: { sq: "shkalle-me-parmake-xhami", en: "glass-staircase-railing" },
      type: "residential",
      systems: ["ballkone-parmake"],
      audience: ["homeowners"],
      featuredOrder: 3,
    },
    {
      id: "vile-trekateshe",
      photo: "project-villa-glass-balconies-shutters",
      title: { sq: "Vilë trekatëshe [TO CONFIRM]", en: "Three-storey villa [TO CONFIRM]" },
      slug: { sq: "vile-trekateshe", en: "three-storey-villa" },
      type: "villa",
      systems: ["ballkone-parmake", "grila", "dyer"],
      audience: ["homeowners"],
      featuredOrder: 4,
    },
    {
      id: "kompleks-banimi",
      photo: "project-residential-blocks-balconies",
      title: { sq: "Kompleks banimi [TO CONFIRM]", en: "Residential complex [TO CONFIRM]" },
      slug: { sq: "kompleks-banimi", en: "residential-complex" },
      type: "residential",
      systems: ["ballkone-parmake", "dritare"],
      audience: ["developers"],
      featuredOrder: 5,
    },
    {
      id: "vila-me-tarrace",
      photo: "project-terrace-glass-railing-vineyard",
      title: { sq: "Vila me tarracë [TO CONFIRM]", en: "Villa with terrace [TO CONFIRM]" },
      slug: { sq: "vila-me-tarrace", en: "villa-with-terrace" },
      type: "villa",
      systems: ["ballkone-parmake"],
      audience: ["homeowners"],
    },
    {
      id: "rinovim-fasade-historike",
      photo: "window-pvc-historic-facade",
      title: {
        sq: "Rinovim dritareje në fasadë historike [TO CONFIRM]",
        en: "Window renovation in a historic façade [TO CONFIRM]",
      },
      slug: { sq: "rinovim-dritareje-fasade-historike", en: "window-renovation-historic-facade" },
      type: "residential",
      systems: ["dritare"],
      audience: ["homeowners", "architects"],
    },
  ];
  for (const p of projects) {
    docs.push({
      _id: `project-${p.id}`,
      _type: "project",
      title: str(p.title),
      slug: slugs(p.slug),
      coverImage: await photo(p.photo),
      city: "[TO CONFIRM]",
      country: "Shqipëri",
      projectType: p.type,
      systems: p.systems.map((id, i) => ref(systemId(id), `s${i}`)),
      audience: p.audience,
      featured: Boolean(p.featuredOrder),
      ...(p.featuredOrder ? { featuredOrder: p.featuredOrder } : {}),
    });
  }

  // --- homePage -------------------------------------------------------------
  const step = (title: T, body?: T, image?: object, key?: string) => ({
    _type: "step",
    _key: key,
    title: str(title),
    ...(body ? { text: text(body) } : {}),
    ...(image ? { image } : {}),
  });
  docs.push({
    _id: "homePage",
    _type: "homePage",
    heroImage: await stock("stock-hero-1"),
    heroImages: await Promise.all(
      ["stock-hero-1", "stock-hero-2", "stock-hero-3", "stock-hero-4"].map((id, i) => stock(id, { key: `h${i + 1}` })),
    ),
    heroEyebrow: str({
      sq: "Partner i certifikuar ALUMIL · Shkodër",
      en: "Certified ALUMIL partner · Shkodër",
    }),
    heroTitle: text({ sq: "Precizion në\nçdo profil.", en: "Precision in\nevery profile." }),
    heroLead: text({
      sq: "Dyer, dritare dhe fasada alumini, të prodhuara në fabrikën tonë në Shkodër dhe të montuara nga ekipi ynë.",
      en: "Aluminium doors, windows and façades, made in our own factory in Shkodër and installed by our own team.",
    }),
    heroCtas: [
      {
        _key: "quote",
        _type: "cta",
        label: str({ sq: "Kërko ofertë", en: "Request a quote" }),
        href: "/kontakt",
        kind: "primary",
      },
      {
        _key: "projects",
        _type: "cta",
        label: str({ sq: "Shiko projektet", en: "View projects" }),
        href: "/projektet",
        kind: "secondary",
      },
    ],
    // 3D step texts: 08_CONTENT wins over 05 (DECISIONS C2)
    profileStorySteps: [
      step(
        { sq: "Profili i aluminit", en: "The aluminium profile" },
        {
          sq: "Profile ALUMIL me dhoma të shumëfishta për forcë dhe izolim.",
          en: "Multi-chamber ALUMIL profiles for strength and insulation.",
        },
        undefined,
        "s1",
      ),
      step(
        { sq: "Ura termike", en: "Thermal break" },
        {
          sq: "Shiritat poliamidi ndajnë aluminin e jashtëm nga i brendshmi dhe ndalojnë humbjen e nxehtësisë.",
          en: "Polyamide strips separate the outer from the inner aluminium and stop heat loss.",
        },
        undefined,
        "s2",
      ),
      step(
        { sq: "Guarnicionet EPDM", en: "EPDM gaskets" },
        {
          sq: "Mbyllje hermetike ndaj ujit, ajrit dhe zhurmës.",
          en: "An airtight seal against water, air and noise.",
        },
        undefined,
        "s3",
      ),
      step(
        { sq: "Xhami dyfish / trefish", en: "Double / triple glazing" },
        {
          sq: "Njësi xhami me hapësirë izoluese, e zgjedhur sipas projektit.",
          en: "Insulated glass units chosen for each project.",
        },
        undefined,
        "s4",
      ),
      step(
        { sq: "I montuar, i testuar", en: "Assembled, tested" },
        {
          sq: "Çdo element montohet dhe kontrollohet në fabrikën tonë në Shkodër.",
          en: "Every unit is assembled and checked in our factory in Shkodër.",
        },
        undefined,
        "s5",
      ),
    ],
    profileStoryTitle: PROFILE_STORY_TITLE,
    systemsTitle: str({ sq: "Sisteme për çdo hapje.", en: "A system for every opening." }),
    featuredProjectsTitle: str({ sq: "Projekte të zgjedhura.", en: "Selected projects." }),
    featuredProjectsIntro: text({
      sq: "Nga vila private te hotele dhe ndërtesa banimi, punë të realizuara nga ekipi ynë në Shqipëri dhe në rajon.",
      en: "From private villas to hotels and residential buildings, work delivered by our team in Albania and the region.",
    }),
    factoryTitle: text({ sq: "Nga profili\nte montimi.", en: "From profile\nto installation." }),
    factoryText: text({
      sq: "Çdo dritare dhe derë prodhohet në fabrikën tonë në Shkodër. Kontrollojmë çdo hap, që cilësia të mos varet nga askush tjetër.",
      en: "Every window and door is made in our factory in Shkodër. We control every step, so quality never depends on anyone else.",
    }),
    factorySteps: [
      step(
        { sq: "Matje & projektim", en: "Survey & design" },
        {
          sq: "Matje në objekt dhe vizatime teknike për çdo element.",
          en: "On-site measurement and technical drawings for every unit.",
        },
        undefined,
        "f1",
      ),
      step(
        { sq: "Prodhim në fabrikë", en: "Factory production" },
        {
          sq: "Prerje, presim dhe montim i profileve ALUMIL.",
          en: "Cutting, crimping and assembly of ALUMIL profiles.",
        },
        undefined,
        "f2",
      ),
      step(
        { sq: "Instalim & garanci", en: "Installation & warranty" },
        {
          sq: "Montim nga ekipi ynë dhe mbështetje pas dorëzimit.",
          en: "Fitted by our own crew, with support after handover.",
        },
        undefined,
        "f3",
      ),
    ],
    factoryImages: [
      await photo("visad-headquarters-factory", { key: "f1" }),
      await photo("visad-truck-aluminium-frames", { key: "f2" }),
      await photo("installation-folding-doors", { key: "f3" }),
    ],
    solutionsTitle: str({ sq: "Për kë punojmë.", en: "Who we work for." }),
    ctaTitle: str({ sq: "Keni një projekt?", en: "Have a project?" }),
    // [TO CONFIRM] reply time: "brenda ditës" vs "brenda 24 orësh" (DECISIONS C3)
    ctaText: text({
      sq: "Na shkruani në WhatsApp me disa foto dhe masa. Ju përgjigjemi brenda ditës.",
      en: "Send us a few photos and measurements on WhatsApp. We reply the same day.",
    }),
  });

  // --- factoryPage ------------------------------------------------------------
  const process: [T, string][] = [
    [{ sq: "Matje", en: "Survey" }, "stock-process-1"],
    [{ sq: "Projektim", en: "Design" }, "stock-process-2"],
    [{ sq: "Prerje CNC", en: "CNC cutting" }, "stock-process-3"],
    [{ sq: "Montim", en: "Assembly" }, "stock-process-4"],
    [{ sq: "Instalim", en: "Installation" }, "stock-process-5"],
  ];
  const machines: [T, string][] = [
    [{ sq: "Sharra CNC për prerjen e profileve", en: "CNC profile cutting saw" }, "stock-factory-machine-1"],
    [{ sq: "Makina e presimit të këndeve", en: "Corner crimping machine" }, "stock-factory-machine-2"],
    [{ sq: "Banko e montimit", en: "Assembly bench" }, "stock-factory-machine-3"],
    [{ sq: "Magazina e profileve ALUMIL", en: "ALUMIL profile stock" }, "stock-factory-machine-4"],
  ];
  docs.push({
    _id: "factoryPage",
    _type: "factoryPage",
    heroImage: await photo("visad-headquarters-factory"),
    title: str({ sq: "Fabrika jonë në Shkodër.", en: "Our factory in Shkodër." }),
    processSteps: await Promise.all(
      process.map(async ([title, image], i) => step(title, undefined, await stock(image), `p${i + 1}`)),
    ),
    machinery: await Promise.all(
      machines.map(async ([caption, image], i) => ({
        _key: `m${i + 1}`,
        _type: "machine",
        image: await stock(image),
        caption: str(caption),
      })),
    ),
  });

  // --- other pages (Phase 7) ----------------------------------------------------
  // Copy from 03 §4 and 08; key specs and careers benefits stay empty until confirmed
  docs.push({
    _id: "pageSettings",
    _type: "pageSettings",
    systemsHero: await stock("stock-systems-hero"),
    systemsTitle: text({
      sq: "Sisteme alumini dhe PVC, të prodhuara në Shkodër.",
      en: "Aluminium and PVC systems, made in Shkodër.",
    }),
    systemsIntro: text({
      sq: "Punojmë me sistemet e ALUMIL, me performancë të testuar termike dhe akustike, dhe i prodhojmë sipas standardeve të tyre.",
      en: "We fabricate ALUMIL systems, with tested thermal and acoustic performance, to ALUMIL's standards.",
    }),
    projectsIntro: text({
      sq: "Nga vila private te hotele dhe ndërtesa banimi, punë të realizuara nga ekipi ynë në Shqipëri dhe në rajon.",
      en: "From private villas to hotels and residential buildings, work delivered by our team in Albania and the region.",
    }),
    careersHero: await photo("installation-folding-doors"),
    contactLead: text({
      sq: "Na tregoni për projektin tuaj. Ju kthejmë përgjigje brenda 24 orësh.",
      en: "Tell us about your project. We reply within 24 hours.",
    }),
  });

  // --- privacy ------------------------------------------------------------------
  docs.push({
    _id: "legal-privacy",
    _type: "legalPage",
    title: str({ sq: "Privatësia", en: "Privacy" }),
    slug: slugs({ sq: "privatesia", en: "privacy" }),
    body: blocks({
      sq: "[TO CONFIRM] Teksti i politikës së privatësisë do të jepet nga klienti ose juristi.",
      en: "[TO CONFIRM] The privacy policy text will be provided by the client or their lawyer.",
    }),
  });

  return docs;
}

const PROFILE_STORY_TITLE = str({
  sq: "Inxhinieri në çdo milimetër.",
  en: "Engineering in every millimetre.",
});

/** Schema fields added after the first seed (Phase 4+), applied with setIfMissing */
const FIELDS_ADDED_LATER: Record<string, Record<string, unknown>> = {
  homePage: { profileStoryTitle: PROFILE_STORY_TITLE },
};

async function main() {
  console.log(`Seeding ${client.config().projectId}/${client.config().dataset}${FORCE ? " (force)" : ""} …`);
  const docs = await buildDocuments();
  console.log(`Uploaded ${assetIds.size} images.`);

  const tx = client.transaction();
  for (const doc of docs) {
    if (FORCE) tx.createOrReplace(doc as SanityDocumentStub & { _id: string });
    else tx.createIfNotExists(doc as SanityDocumentStub & { _id: string });
  }
  // Fields added after the first seed: fill them only where still empty
  for (const [id, fields] of Object.entries(FIELDS_ADDED_LATER)) tx.patch(id, (p) => p.setIfMissing(fields));

  const result = await tx.commit({ visibility: "async" });
  console.log(
    `${FORCE ? "Replaced" : "Created (if missing)"} ${docs.length} documents · tx ${result.transactionId}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
