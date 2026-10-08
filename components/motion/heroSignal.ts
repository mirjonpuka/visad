"use client";

/*
 * "Hero may enter now" signal (Motion §2): fired when the intro wipe starts
 * leaving (first visit), immediately on later visits, and after each page
 * transition. Stored on <html data-hero-in="full|short"> so components that
 * mount late still react.
 */

export type HeroInKind = "full" | "short";
const EVENT = "visad:hero-in";

export function signalHeroIn(kind: HeroInKind) {
  document.documentElement.dataset.heroIn = kind;
  window.dispatchEvent(new CustomEvent<HeroInKind>(EVENT, { detail: kind }));
}

/** Calls `callback` once the hero may enter (right away if it already may). */
export function onHeroIn(callback: (kind: HeroInKind) => void) {
  const current = document.documentElement.dataset.heroIn as HeroInKind | undefined;
  if (current) {
    callback(current);
    return () => {};
  }
  const handler = (event: Event) => callback((event as CustomEvent<HeroInKind>).detail);
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}
