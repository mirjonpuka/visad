"use client";

import { useEffect, useSyncExternalStore } from "react";

/*
 * Detail pages (project, system, solution, job) have a different slug in each
 * language. The page renders <AlternateSlugs> with its locale → slug map; the
 * language switcher (in the navbar, outside the page tree) reads it so "EN"
 * leads to /en/projects/<english-slug> instead of keeping the Albanian one.
 */

type Map = Record<string, string>;

let current: Map | null = null;
const listeners = new Set<() => void>();

function set(next: Map | null) {
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAlternateSlugs(): Map | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

export function AlternateSlugs({ slugs }: { slugs: Map }) {
  const key = JSON.stringify(slugs);
  useEffect(() => {
    set(JSON.parse(key) as Map);
    return () => set(null);
  }, [key]);
  return null;
}
