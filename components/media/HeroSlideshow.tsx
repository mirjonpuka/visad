"use client";

import { useEffect, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { CMSImage } from "./CMSImage";

const INTERVAL = 6000;

/**
 * Home hero photos (owner request): crossfade 1.4s every 6s with a slow zoom.
 * The first photo is the LCP image (priority); each next photo mounts one
 * slide ahead, after the page has loaded. Reduced motion: first photo only. Pauses while the tab is
 * hidden or the hero is scrolled out of view.
 */
export function HeroSlideshow({ images, placeholderNote }: { images: SiteImage[]; placeholderNote?: string }) {
  const { ready, reducedMotion } = useMotion();
  const [index, setIndex] = useState(0);
  /** Highest photo index loaded so far (photos stay mounted once reached) */
  const [reach, setReach] = useState(1);
  const [mounted, setMounted] = useState(false);
  const cycling = ready && !reducedMotion && images.length > 1;

  // Mount the other photos once the page has loaded
  useEffect(() => {
    if (!cycling) return;
    const start = () => setMounted(true);
    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 400);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [cycling]);

  useEffect(() => {
    if (!cycling || !mounted) return;
    let visible = true;
    const observer = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    const hero = document.querySelector("[data-hero-image]");
    if (hero) observer.observe(hero);
    const id = window.setInterval(() => {
      if (!visible || document.hidden) return;
      setIndex((i) => {
        const next = (i + 1) % images.length;
        setReach((r) => Math.max(r, next + 1));
        return next;
      });
    }, INTERVAL);
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, [cycling, mounted, images.length]);

  return (
    <>
      {images.map((image, i) => {
        // Only the current and the next photo are loaded (A2: the others used to
        // download at once and slowed the project tiles on 4G)
        if (i > 0 && (!mounted || i > reach)) return null;
        const active = i === index;
        return (
          <div
            key={i}
            aria-hidden={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-standard",
              active ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 transition-transform duration-[7400ms] ease-linear",
                cycling && active ? "scale-[1.06]" : "scale-100",
              )}
            >
              <CMSImage
                image={image}
                fill
                priority={i === 0}
                decorative={!active}
                sizes="100vw"
                className="rounded-none"
                placeholderNote={placeholderNote}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
