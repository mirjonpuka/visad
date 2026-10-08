"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register once for every motion component (Motion §1)
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Easing tokens (Motion §1) as GSAP eases */
export const EASE = {
  outExpo: "expo.out", // cubic-bezier(0.16, 1, 0.3, 1)
  inOutQuart: "power4.inOut", // cubic-bezier(0.76, 0, 0.24, 1)
  standard: "power2.inOut",
} as const;

/** Default trigger: element top reaches 85% of the viewport, play once (Motion §4) */
export const ENTER_START = "top 85%";

/**
 * Run `fn` when the browser is idle (≤ 1.5s later). Scroll reveals set up
 * this way, each in its own small task, instead of all inside React's
 * hydration commit — that one long task was most of the mobile TBT (Phase 9).
 */
export function afterIdle(fn: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 50);
  return () => window.clearTimeout(id);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
