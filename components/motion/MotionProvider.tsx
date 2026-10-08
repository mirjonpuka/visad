"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type MotionFlags = {
  /** prefers-reduced-motion: reduce */
  reducedMotion: boolean;
  /** No fine pointer (phones, most tablets) */
  isTouch: boolean;
  /** Fine pointer + hover + ≥1200px: custom cursor & magnetic buttons (UI §14) */
  isLaptop: boolean;
  /** ≤4 cores, ≤4GB memory or Save-Data (Motion §1) */
  isLowPower: boolean;
  /** Flags are known (false during SSR / first render) */
  ready: boolean;
};

const SSR_FLAGS: MotionFlags = {
  reducedMotion: false,
  isTouch: false,
  isLaptop: false,
  isLowPower: false,
  ready: false,
};

const queries = {
  reduced: "(prefers-reduced-motion: reduce)",
  fine: "(hover: hover) and (pointer: fine)",
  laptop: "(hover: hover) and (pointer: fine) and (min-width: 75rem)",
};

let cached: MotionFlags | null = null;

function read(): MotionFlags {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const next: MotionFlags = {
    reducedMotion: matchMedia(queries.reduced).matches,
    isTouch: !matchMedia(queries.fine).matches,
    isLaptop: matchMedia(queries.laptop).matches,
    isLowPower:
      (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || Boolean(nav.connection?.saveData),
    ready: true,
  };
  // Keep a stable object while nothing changed (useSyncExternalStore requirement)
  if (cached && JSON.stringify(cached) === JSON.stringify(next)) return cached;
  cached = next;
  return next;
}

function subscribe(onChange: () => void) {
  const lists = Object.values(queries).map((q) => matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

const MotionContext = createContext<MotionFlags>(SSR_FLAGS);

/** Exposes reducedMotion, isTouch, isLaptop, isLowPower to every motion component. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const flags = useSyncExternalStore(subscribe, read, () => SSR_FLAGS);
  return <MotionContext.Provider value={flags}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  return useContext(MotionContext);
}
