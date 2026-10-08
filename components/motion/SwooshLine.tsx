"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { useMotion } from "./MotionProvider";

/** The logo's S-swoosh centre line (brand/logo/visad-logo-*.svg) */
const SWOOSH_PATH = "M-20 460H430Q482 460 505 400L615 110Q642 40 700 40H1300";

/**
 * Huge 1px swoosh behind the CTA (UI §3.8, Motion §4.8): draws itself with
 * scroll (scrub) as the section passes. Static with reduced motion.
 */
export function SwooshLine({
  className,
  mode = "scroll",
  opacity = 0.2,
}: {
  className?: string;
  /** "scroll": scrubbed by the section; "draw": draws once on mount (404) */
  mode?: "scroll" | "draw";
  opacity?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  const { reducedMotion, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || reducedMotion || !ref.current) return;
      const path = ref.current;
      if (mode === "draw") {
        gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: "power3.inOut", delay: 0.3 });
        return;
      }
      gsap.fromTo(
        path,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: path.closest("section") ?? path,
            start: "top 90%",
            end: "bottom 60%",
            scrub: true,
          },
        },
      );
    },
    { dependencies: [ready, reducedMotion, mode] },
  );

  return (
    <svg aria-hidden viewBox="0 0 1280 500" preserveAspectRatio="none" className={className}>
      <path
        ref={ref}
        d={SWOOSH_PATH}
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={ready && !reducedMotion ? 1 : 0}
        fill="none"
        stroke="var(--color-red-500)"
        strokeOpacity={opacity}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
