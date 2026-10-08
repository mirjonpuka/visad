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
