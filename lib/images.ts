import manifest from "./images.manifest.json";
import stockManifest from "./stock.manifest.json";

export type ImageSource = { src: string; width: number; height: number };

/**
 * Image shape accepted by CMSImage. Either a Sanity asset (served by the
 * Sanity CDN, auto=format) or pre-converted WebP files in /public/images.
 */
export type SiteImage = {
  /** Sanity asset (toSiteImage in sanity/lib/types.ts); width/height after crop */
  sanity?: {
    assetId: string;
    crop: { top: number; bottom: number; left: number; right: number } | null;
    hotspot: { x: number; y: number } | null;
    width: number;
    height: number;
  };
  /** Local WebP widths of the same picture, any order */
  sources?: ImageSource[];
  /** Already localized string (Sanity) or per-locale map (local manifest) */
  alt: string | Partial<Record<string, string>>;
  blurDataURL?: string;
  /** Temporary stock/AI image (Brand §5) */
  isPlaceholder?: boolean;
  /** What photo belongs here, shown at the bottom centre */
  placeholderNote?: string;
};

type ManifestEntry = {
  id: string;
  alt: Record<string, string>;
  blurDataURL: string;
  isPlaceholder: boolean;
  web: ImageSource[];
  crops: Record<string, ImageSource>;
};

const entries = manifest as Record<string, ManifestEntry>;
export type LocalImageId = keyof typeof manifest;

type StockEntry = {
  alt: Record<string, string>;
  blurDataURL: string;
  placeholderNote: string;
  web: ImageSource[];
};
export type StockImageId = keyof typeof stockManifest;

/**
 * Temporary stock photo (Pexels License) for a slot that has no Visad photo
 * yet. Always flagged as placeholder, so CMSImage shows the "will be replaced
 * with …" note. Never used on project pages (Brand §5).
 */
export function stockImage(id: StockImageId): SiteImage {
  const entry = (stockManifest as Record<string, StockEntry>)[id];
  return {
    sources: entry.web,
    alt: entry.alt,
    blurDataURL: entry.blurDataURL,
    isPlaceholder: true,
    placeholderNote: entry.placeholderNote,
  };
}

/** A handoff photo, either the full square image (all widths) or one crop. */
export function localImage(id: LocalImageId, crop?: string): SiteImage {
  const entry = entries[id];
  const cropped = crop ? entry.crops[crop] : undefined;
  if (crop && !cropped) throw new Error(`Unknown crop "${crop}" for image "${id}"`);
  return {
    sources: cropped ? [cropped] : entry.web,
    alt: entry.alt,
    blurDataURL: entry.blurDataURL,
    isPlaceholder: entry.isPlaceholder,
  };
}
