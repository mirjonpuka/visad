"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { useMotion } from "./MotionProvider";

/** 2px red bar at the very top bound to page scroll (Motion §4.8), for long detail pages. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || reducedMotion || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.2 },
        },
      );
    },
    { dependencies: [ready, reducedMotion] },
  );

  if (ready && reducedMotion) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-red-500"
    />
  );
}
