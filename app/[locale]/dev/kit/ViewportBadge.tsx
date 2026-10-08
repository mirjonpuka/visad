"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

/** Fixed badge showing the current viewport width (dev kit only). */
export function ViewportBadge() {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 0,
  );
  const range = width >= 1200 ? "laptop" : width >= 768 ? "tablet" : "phone";
  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-base bg-ink-800 px-3 py-2 font-mono text-label text-text-on-dark uppercase shadow-mega">
      {width ? `${width}px · ${range}` : "—"}
    </div>
  );
}
