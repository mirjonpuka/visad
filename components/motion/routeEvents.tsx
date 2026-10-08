"use client";

import { useEffect, useRef } from "react";
// Plain URL path is enough for change detection (no locale mapping needed)
import { usePathname } from "next/navigation";

/*
 * Route-change broadcast. Reading the pathname makes a component depend on
 * URL data; in the prerendered fallback shell of dynamic routes that would
 * postpone everything a provider wraps. So exactly one tiny component reads
 * it (inside <Suspense> in the layout) and the motion providers subscribe.
 */

const EVENT = "visad:route";
let currentPath: string | undefined;

/** Render once in the layout, wrapped in <Suspense fallback={null}>. */
export function RouteChangeEmitter() {
  const pathname = usePathname();
  useEffect(() => {
    currentPath = pathname;
    window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: pathname }));
  }, [pathname]);
  return null;
}

/** Calls `callback(pathname)` after every client-side route change (not for the first page). */
export function useRouteChange(callback: (pathname: string) => void) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  useEffect(() => {
    let seen = currentPath;
    const handler = (event: Event) => {
      const path = (event as CustomEvent<string>).detail;
      if (seen !== undefined && path !== seen) ref.current(path);
      seen = path;
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);
}
