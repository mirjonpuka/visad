import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

export type SanityCrop = { top: number; bottom: number; left: number; right: number };
export type SanityHotspot = { x: number; y: number; width?: number; height?: number };

/**
 * Sanity CDN URL for a width: auto=format serves AVIF/WebP, q78, crop applied
 * (Architecture §5). Used as the next/image loader, so there is no double
 * optimization.
 */
export function sanityImageUrl(
  image: { assetId: string; crop?: SanityCrop | null; hotspot?: SanityHotspot | null },
  width: number,
) {
  return builder
    .image({
      asset: { _ref: image.assetId },
      crop: image.crop ?? undefined,
      hotspot: image.hotspot ?? undefined,
    })
    .width(width)
    .auto("format")
    .quality(78)
    .fit("max")
    .url();
}
