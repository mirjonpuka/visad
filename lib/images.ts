import manifest from "./images.manifest.json";
import stockManifest from "./stock.manifest.json";

export type ImageSource = { src: string; width: number; height: number };

/**
 * Image shape accepted by CMSImage. Until Sanity is wired up (Phase 3) it is
 * built from the pre-converted WebP files in /public/images.
 */
export type SiteImage = {
  /** All available widths of the same picture, any order */
  sources: ImageSource[];
  alt: Partial<Record<string, string>>;
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
