"use client";

import Image, { type ImageLoader } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { SiteImage } from "@/lib/images";
import { cn, pickLocale } from "@/lib/utils";
import { sanityImageUrl } from "@/sanity/lib/image";
import { PlaceholderImage } from "./PlaceholderImage";

type Props = {
  image: SiteImage | null | undefined;
  /** Responsive sizes attribute; always set it to the rendered width */
  sizes: string;
  /** CSS aspect-ratio of the box, e.g. "16/10". Omit + fill to cover a sized parent */
  ratio?: string;
  fill?: boolean;
  /** LCP image: eager + high fetch priority (Architecture §5) */
  priority?: boolean;
  /** Sanity quality (default 78); tiles use less (A2) */
  quality?: number;
  /** Decorative image → alt="" */
  decorative?: boolean;
  /** Focal point override, e.g. "50% 30%" (default: Sanity hotspot) */
  objectPosition?: string;
  /** Note shown when the slot has no image */
  placeholderNote?: string;
  /** Small thumbnails: show only "Temporary photo" instead of the full note */
  shortNote?: boolean;
  className?: string;
  imgClassName?: string;
};

/**
 * One component for every image (UI §2.8): reserves the box, shows LQIP blur
 * under a skeleton shimmer, fades the image in (500ms) once decoded, and falls
 * back to PlaceholderImage when the slot is empty.
 *
 * Sanity images: the next/image loader builds Sanity CDN URLs (auto=format →
 * AVIF/WebP, q78, crop applied), the hotspot becomes the object-position.
 * Local images: picks the closest pre-converted WebP width in /public/images.
 */
export function CMSImage({
  image,
  sizes,
  ratio,
  fill,
  priority,
  quality,
  decorative,
  objectPosition,
  placeholderNote,
  shortNote,
  className,
  imgClassName,
}: Props) {
  const locale = useLocale();
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const sanity = image?.sanity;
  const sources = image?.sources;
  const largest = sources?.length ? sources.reduce((a, b) => (b.width > a.width ? b : a)) : undefined;

  const loader = useCallback<ImageLoader>(
    ({ width }) => {
      if (sanity) return sanityImageUrl(sanity, width, quality);
      if (!sources?.length) return "";
      // Smallest pre-generated width that covers the requested width
      const sorted = [...sources].sort((a, b) => a.width - b.width);
      return (sorted.find((s) => s.width >= width) ?? sorted[sorted.length - 1]).src;
    },
    [sanity, sources, quality],
  );

  // Cached images can finish before hydration, so onLoad never fires
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const natural = sanity ?? largest;
  const boxRatio = ratio ?? (!fill && natural ? `${natural.width}/${natural.height}` : undefined);

  if (!image || !natural) {
    return (
      <PlaceholderImage
        note={placeholderNote}
        ratio={boxRatio}
        className={cn(fill && "absolute inset-0", className)}
      />
    );
  }

  const alt = decorative
    ? ""
    : typeof image.alt === "string"
      ? image.alt
      : (pickLocale(image.alt, locale) ?? "");
  // Temporary photos always say what will replace them (Brand §5, owner request)
  const note = image.isPlaceholder
    ? shortNote
      ? "Temporary photo"
      : (image.placeholderNote ?? "Temporary photo")
    : undefined;
  const position =
    objectPosition ?? (sanity?.hotspot ? `${sanity.hotspot.x * 100}% ${sanity.hotspot.y * 100}%` : undefined);
  // `src` only identifies the image; the loader returns the real URL
  const src = sanity ? `/sanity/${sanity.assetId}` : largest!.src.replace(/\.webp$/, "");

  return (
    <div
      className={cn("relative overflow-hidden rounded-base", fill ? "absolute inset-0" : "w-full", className)}
      style={{ aspectRatio: boxRatio }}
    >
      {/* LQIP blur + shimmer until the image is decoded (UI §13.3) */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-(--sk-base) bg-cover bg-center transition-opacity duration-500",
          loaded ? "opacity-0" : "skeleton opacity-100",
        )}
        style={image.blurDataURL ? { backgroundImage: `url(${image.blurDataURL})` } : undefined}
      />
      <Image
        ref={imgRef}
        loader={loader}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        className={cn(
          "motion-fade object-cover transition-opacity duration-500 ease-standard",
          // LCP images paint as soon as they decode, without waiting for hydration
          loaded || priority ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        style={position ? { objectPosition: position } : undefined}
      />
      {note && <span className="ph-note ph-note--photo">{note}</span>}
    </div>
  );
}
