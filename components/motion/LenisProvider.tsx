"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { useMotion } from "./MotionProvider";
import { useRouteChange } from "./routeEvents";

const LenisContext = createContext<Lenis | null>(null);

/**
 * Smooth scroll (Motion §1): Lenis on laptop/tablet with a fine pointer,
 * native scroll on touch-only phones and with reduced motion. Driven by the
 * GSAP ticker so ScrollTrigger stays in sync.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const { reducedMotion, isTouch, ready } = useMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (!ready || reducedMotion || isTouch) return;
    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    const raf = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
    const id = requestAnimationFrame(() => setLenis(instance));
    return () => {
      cancelAnimationFrame(id);
      gsap.ticker.remove(raf);
      instance.destroy();
      document.documentElement.classList.remove("lenis");
      setLenis(null);
    };
  }, [ready, reducedMotion, isTouch]);

  // Refresh trigger positions once fonts are in (Motion §7)
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // New page: re-measure after layout settles
  useRouteChange(() => {
    window.setTimeout(() => ScrollTrigger.refresh(), 120);
  });

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  return useContext(LenisContext);
}
