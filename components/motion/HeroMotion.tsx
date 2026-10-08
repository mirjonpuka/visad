"use client";

import { useRef, type ReactNode } from "react";
import { htmlRef, type HtmlTag } from "@/lib/utils";
import { EASE, gsap, useGSAP } from "./gsap";
import { onHeroIn } from "./heroSignal";
import { useMotion } from "./MotionProvider";

/**
 * Hero entrance + parallax (Motion §2, §3.1, §4.4). Renders the hero element
 * itself (`as`, default section) and animates, inside it:
 * - [data-hero-image]: scale 1.08 → 1 (1.6s; 1.1s on later visits)
 * - [data-hero-parallax]: moves at ~0.85× scroll speed and darkens slightly (not on touch)
 * - [data-hero-fade]: fade up, 80ms stagger
 * Headlines use <SplitHeadline trigger="manual"> (same "hero-in" signal).
 */
export function HeroMotion({
  as: Tag = "section",
  className,
  children,
  id,
}: {
  as?: HtmlTag;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, isTouch, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || !ref.current) return;
      const root = ref.current;
      const image = root.querySelector<HTMLElement>("[data-hero-image]");
      const parallax = root.querySelector<HTMLElement>("[data-hero-parallax]");
      const fades = root.querySelectorAll<HTMLElement>("[data-hero-fade]");
      gsap.set(fades, { visibility: "visible" });
      if (reducedMotion) return;

      gsap.set(fades, { autoAlpha: 0, y: 24 });
      if (image) gsap.set(image, { scale: 1.08 });

      const stop = onHeroIn((kind) => {
        const short = kind === "short";
        if (image) gsap.to(image, { scale: 1, duration: short ? 1.1 : 1.6, ease: EASE.outExpo });
        gsap.to(fades, {
          autoAlpha: 1,
          y: 0,
          duration: short ? 0.7 : 0.9,
          ease: EASE.outExpo,
          stagger: 0.08,
          delay: short ? 0.1 : 0.25,
        });
      });

      if (parallax && !isTouch) {
        gsap.to(parallax, {
          yPercent: 15,
          filter: "brightness(0.75)",
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
      }
      return stop;
    },
    { dependencies: [ready, reducedMotion, isTouch], scope: ref },
  );

  return (
    <Tag ref={htmlRef(ref)} id={id} className={className}>
      {children}
    </Tag>
  );
}
