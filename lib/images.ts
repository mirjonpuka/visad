import manifest from "./images.manifest.json";

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
