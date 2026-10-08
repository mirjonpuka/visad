"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type LayoutUI = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  /** Navbar is transparent over a full-bleed hero until 40px scrolled */
  heroUnderNav: boolean;
  setHeroUnderNav: (value: boolean) => void;
  /** Height of the visible cookie banner, so the WhatsApp FAB can move up */
  cookieBannerHeight: number;
  setCookieBannerHeight: (height: number) => void;
};

const LayoutUIContext = createContext<LayoutUI | null>(null);

export function LayoutUIProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroUnderNav, setHeroUnderNav] = useState(false);
  const [cookieBannerHeight, setCookieBannerHeight] = useState(0);

  const value = useMemo(
    () => ({
      mobileMenuOpen,
      setMobileMenuOpen,
      heroUnderNav,
      setHeroUnderNav,
      cookieBannerHeight,
      setCookieBannerHeight,
    }),
    [mobileMenuOpen, heroUnderNav, cookieBannerHeight],
  );
  return <LayoutUIContext.Provider value={value}>{children}</LayoutUIContext.Provider>;
}

export function useLayoutUI() {
  const ctx = useContext(LayoutUIContext);
  if (!ctx) throw new Error("useLayoutUI must be used inside LayoutUIProvider");
  return ctx;
}

/**
 * Rendered by pages that start with a full-bleed dark hero (Home, project
 * detail…): the navbar is transparent with white content until 40px scrolled.
 */
export function HeroUnderNav() {
  const { setHeroUnderNav } = useLayoutUI();
  useEffect(() => {
    setHeroUnderNav(true);
    return () => setHeroUnderNav(false);
  }, [setHeroUnderNav]);
  return null;
}
