"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(containers: RefObject<HTMLElement | null>[]) {
  return containers
    .flatMap((ref) => {
      const root = ref.current;
      if (!root) return [];
      // The container itself may be focusable (e.g. a trigger button)
      const own = root.matches(FOCUSABLE) ? [root] : [];
      return [...own, ...Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))];
    })
    .filter((el) => !el.closest("[inert]") && el.getClientRects().length > 0);
}

/**
 * Keeps Tab / Shift+Tab inside the given containers while active
 * (UI §2.2 mega-menu, §2.3 mobile menu).
 */
export function useFocusTrap(
  active: boolean,
  containers: RefObject<HTMLElement | null>[],
  /** Only trap when focus is already inside (menus that can open on hover) */
  onlyWhenInside = false,
) {
  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = focusables(containers);
      if (!items.length) return;
      const current = document.activeElement as HTMLElement | null;
      const index = current ? items.indexOf(current) : -1;
      if (onlyWhenInside && index === -1) return;
      // Move explicitly: the containers need not be adjacent in the DOM
      // (e.g. a trigger in the nav row and its panel at the end of <header>)
      event.preventDefault();
      const next = event.shiftKey
        ? index <= 0
          ? items.length - 1
          : index - 1
        : index === -1 || index === items.length - 1
          ? 0
          : index + 1;
      items[next].focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // containers are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onlyWhenInside]);
}

/** Locks page scroll while active, without layout shift from the scrollbar. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [active]);
}

/** Calls handler on Escape while active. */
export function useEscape(active: boolean, handler: () => void) {
  useEffect(() => {
    if (!active) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handler();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, handler]);
}
