"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteData } from "@/lib/site-data";

const SiteDataContext = createContext<SiteData | null>(null);

/** Makes the CMS layout data (menus, contact, WhatsApp) available to client components. */
export function SiteDataProvider({ value, children }: { value: SiteData; children: ReactNode }) {
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used inside SiteDataProvider");
  return ctx;
}
