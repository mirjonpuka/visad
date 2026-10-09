import type { SiteImage } from "@/lib/images";
import type { SanityCrop, SanityHotspot } from "./image";

/** Shape of the IMAGE projection in queries.ts */
export type SanityImage = {
  assetId: string;
  width: number;
  height: number;
  lqip?: string | null;
  crop?: SanityCrop | null;
  hotspot?: SanityHotspot | null;
  alt?: string | null;
  isPlaceholder?: boolean | null;
  placeholderNote?: string | null;
} | null;

export type Slugs = { language: string; slug: string }[] | null;

export type LayoutData = {
  settings: {
    companyName?: string;
    address?: string;
    geo?: { lat: number; lng: number } | null;
    phones?: { label?: string; number: string }[] | null;
    whatsappNumber?: string;
    whatsappMessage?: string | null;
    email?: string;
    openingHours?: { days?: string; hours?: string }[] | null;
    social?: { platform: string; url: string }[] | null;
    alumilText?: string | null;
    alumilLogo?: SanityImage;
  } | null;
  systems: {
    _id: string;
    order: number;
    title: string;
    slug: string;
    slugs: Slugs;
    text: string;
    thumbnail: SanityImage;
  }[];
  solutions: {
    _id: string;
    segment: string;
    title: string;
    slug: string;
    slugs: Slugs;
    text?: string;
    image: SanityImage;
  }[];
};

type TitleText = { title?: string | null; text?: string | null };

export type HomeData = {
  settings: { stats?: { value: string; label?: string | null }[] | null; whatsappNumber?: string } | null;
  home: {
    heroImage: SanityImage;
    heroImages?: SanityImage[] | null;
    heroVideo?: string | null;
    heroEyebrow?: string | null;
    heroTitle?: string | null;
    heroLead?: string | null;
    heroCtas?: { label?: string | null; href?: string | null; kind?: string | null }[] | null;
    profileStoryTitle?: string | null;
    profileStorySteps?: TitleText[] | null;
    systemsTitle?: string | null;
    featuredProjectsTitle?: string | null;
    featuredProjectsIntro?: string | null;
    factoryTitle?: string | null;
    factoryText?: string | null;
    factorySteps?: TitleText[] | null;
    factoryImages?: SanityImage[] | null;
    solutionsTitle?: string | null;
    ctaTitle?: string | null;
    ctaText?: string | null;
  } | null;
  systems: {
    _id: string;
    title: string;
    slug: string;
    slugs: Slugs;
    text: string;
    image: SanityImage;
    hasDatasheet: boolean;
  }[];
  featured: {
    _id: string;
    title: string;
    slug: string;
    slugs: Slugs;
    city?: string | null;
    year?: number | null;
    coverImage: SanityImage;
    systems?: string[] | null;
  }[];
};

export type ProjectListItem = {
  _id: string;
  title: string;
  slug: string;
  slugs: Slugs;
  city: string;
  year?: number;
  projectType: string;
  systemSlugs?: string[] | null;
  coverImage: SanityImage;
};

// ---------------------------------------------------------------------------
// Phase 7 pages
// ---------------------------------------------------------------------------

/** Portable Text blocks (rendered by components/ui/RichText) */
export type Blocks = { _type: string; _key?: string; [key: string]: unknown }[] | null;

export type Seo = {
  title?: string | null;
  description?: string | null;
  noIndex?: boolean | null;
  image?: SanityImage;
} | null;

export type Spec = { label?: string | null; value?: string | null; unit?: string | null };
export type Benefit = { icon?: string | null; title?: string | null; text?: string | null };

export type DownloadItem = {
  _id: string;
  title: string;
  url?: string | null;
  size?: number | null;
  extension?: string | null;
  language?: string | null;
  category?: string | null;
};

export type ProjectCard = {
  _id: string;
  title: string;
  slug: string;
  slugs: Slugs;
  city?: string | null;
  year?: number | null;
  projectType?: string | null;
  coverImage: SanityImage;
  systems?: string[] | null;
};

export type SystemCard = {
  _id: string;
  title: string;
  slug: string;
  slugs: Slugs;
  text?: string | null;
  image: SanityImage;
};

export type SystemsIndexData = {
  page: {
    hero: SanityImage;
    title?: string | null;
    intro?: string | null;
    keySpecs?: Spec[] | null;
  } | null;
  systems: (SystemCard & { features?: string[] | null })[];
  downloads: DownloadItem[];
};

export type SystemData = {
  _id: string;
  title: string;
  slug: string;
  slugs: Slugs;
  text?: string | null;
  heroImage: SanityImage;
  overview: Blocks;
  benefits?: Benefit[] | null;
  series?: {
    _id: string;
    title: string;
    image: SanityImage;
    specs?: Spec[] | null;
    datasheet?: string | null;
    description?: string | null;
  }[] | null;
  specs?: Spec[] | null;
  crossSection: SanityImage;
  finishes?: {
    _id: string;
    name: string;
    code?: string | null;
    type?: string | null;
    swatch?: string | null;
    image: SanityImage;
  }[] | null;
  downloads?: (DownloadItem | null)[] | null;
  faqs?: { question?: string | null; answer: Blocks }[] | null;
  projects: ProjectCard[];
  seo: Seo;
} | null;

export type ProjectsPageData = {
  intro?: string | null;
  projects: (Omit<ProjectCard, "systems"> & { systems?: { key: string; title: string }[] | null })[];
  systems: { key: string; title: string }[];
};

export type ProjectPageData = {
  project: {
    _id: string;
    title: string;
    slug: string;
    slugs: Slugs;
    city?: string | null;
    country?: string | null;
    year?: number | null;
    projectType?: string | null;
    client?: string | null;
    areaM2?: number | null;
    summary?: string | null;
    story: Blocks;
    coverImage: SanityImage;
    gallery?: SanityImage[] | null;
    systems?: SystemCard[] | null;
    seo: Seo;
  } | null;
  order: { _id: string; title: string; slug: string; slugs: Slugs; coverImage: SanityImage }[];
};

type Stat = { value: string; label?: string | null };

export type FactoryData = {
  factory: {
    heroImage: SanityImage;
    heroVideo?: string | null;
    title?: string | null;
    intro?: string | null;
    stats?: Stat[] | null;
    processSteps?: { title?: string | null; text?: string | null; image: SanityImage }[] | null;
    machinery?: { image: SanityImage; caption?: string | null }[] | null;
    certificates?: {
      _id: string;
      title: string;
      issuer?: string | null;
      year?: number | null;
      url?: string | null;
      thumbnail: SanityImage;
    }[] | null;
    team?: { name?: string | null; role?: string | null; photo: SanityImage }[] | null;
    seo: Seo;
  } | null;
  home: { factoryText?: string | null } | null;
  settings: { stats?: Stat[] | null; alumilCertificate?: string | null } | null;
};

export type SolutionData = {
  _id: string;
  segment: string;
  title: string;
  slug: string;
  slugs: Slugs;
  heroTitle?: string | null;
  heroImage: SanityImage;
  intro?: string | null;
  benefits?: Benefit[] | null;
  systems?: SystemCard[] | null;
  ctaKind?: "whatsapp" | "quote" | "tender" | null;
  projects: ProjectCard[];
  downloads: DownloadItem[];
  seo: Seo;
} | null;

export type JobListItem = {
  _id: string;
  title: string;
  slug: string;
  slugs: Slugs;
  type?: string | null;
  location?: string | null;
};

export type CareersData = {
  page: { hero: SanityImage; intro?: string | null; benefits?: Benefit[] | null } | null;
  jobs: JobListItem[];
};

export type JobData = (JobListItem & { publishedAt?: string | null; description: Blocks }) | null;

export type LegalData = {
  title: string;
  slug: string;
  slugs: Slugs;
  body: Blocks;
  _updatedAt: string;
} | null;

/** Cropped size of a Sanity image (crop values are fractions) */
function croppedSize(image: NonNullable<SanityImage>) {
  const crop = image.crop;
  if (!crop) return { width: image.width, height: image.height };
  return {
    width: Math.round(image.width * (1 - crop.left - crop.right)),
    height: Math.round(image.height * (1 - crop.top - crop.bottom)),
  };
}

/** Convert a queried Sanity image into the SiteImage CMSImage renders. */
export function toSiteImage(image: SanityImage): SiteImage | null {
  if (!image?.assetId) return null;
  const { width, height } = croppedSize(image);
  return {
    sanity: {
      assetId: image.assetId,
      crop: image.crop ?? null,
      hotspot: image.hotspot ?? null,
      width,
      height,
    },
    alt: image.alt ?? "",
    blurDataURL: image.lqip ?? undefined,
    isPlaceholder: Boolean(image.isPlaceholder),
    placeholderNote: image.placeholderNote ?? undefined,
  };
}
