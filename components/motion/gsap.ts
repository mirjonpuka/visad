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

export { gsap, ScrollTrigger, SplitText, useGSAP };
