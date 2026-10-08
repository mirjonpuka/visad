"use client";

import { useState } from "react";
import { CMSImage } from "@/components/media/CMSImage";
import { Lightbox } from "@/components/media/Lightbox";
import { ImageWipe } from "@/components/motion/reveals";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Rows of 1, 2, 3 images, repeated (UI §7.4 editorial gallery). */
function rows(images: SiteImage[]) {
  const out: { start: number; items: SiteImage[] }[] = [];
  const sizes = [1, 2, 3];
  let i = 0;
  let r = 0;
  while (i < images.length) {
    const n = sizes[r % 3];
    out.push({ start: i, items: images.slice(i, i + n) });
    i += n;
    r += 1;
  }
  return out;
}

const RATIO: Record<number, string> = { 1: "16/9", 2: "4/3", 3: "4/5" };
const SIZES: Record<number, string> = {
  1: "(min-width: 1440px) 1312px, 100vw",
  2: "(min-width: 768px) 50vw, 100vw",
  3: "(min-width: 768px) 33vw, 100vw",
};

export function ProjectGallery({
  images,
  labels,
}: {
  images: SiteImage[];
  labels: { open: string; close: string; prev: string; next: string; counter: string };
}) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-col gap-5">
        {rows(images).map((row) => (
          <div key={row.start} className={cn("grid gap-5", row.items.length === 2 && "md:grid-cols-2", row.items.length === 3 && "md:grid-cols-3")}>
            {row.items.map((image, j) => {
              const n = row.start + j;
              return (
                <ImageWipe key={n} index={j} className="rounded-base">
                  <button
                    type="button"
                    onClick={() => setIndex(n)}
                    data-cursor="view"
                    aria-label={labels.open.replace("{n}", String(n + 1)).replace("{total}", String(images.length))}
                    className="group block w-full overflow-hidden rounded-base"
                  >
                    <CMSImage
                      image={image}
                      ratio={RATIO[row.items.length]}
                      sizes={SIZES[row.items.length]}
                      imgClassName="transition-transform duration-(--dur-l) ease-out-expo group-hover:scale-[1.03]"
                    />
                  </button>
                </ImageWipe>
              );
            })}
          </div>
        ))}
      </div>
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onIndex={setIndex} labels={labels} />
    </>
  );
}
