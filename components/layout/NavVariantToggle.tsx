"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "links" | "menu";
const KEY = "visad-dev-nav-variant";

/**
 * Dev/preview only: switch the 1024–1199px navbar between full links and the
 * menu button (conflict C5) so the owner can compare. Not rendered in production.
 */
export function NavVariantToggle() {
  const [variant, setVariant] = useState<Variant>("links");

  useEffect(() => {
    let saved: Variant = "links";
    try {
      saved = localStorage.getItem(KEY) === "menu" ? "menu" : "links";
    } catch {}
    document.documentElement.setAttribute("data-nav-variant", saved);
    const id = requestAnimationFrame(() => setVariant(saved));
    return () => cancelAnimationFrame(id);
  }, []);

  function choose(next: Variant) {
    setVariant(next);
    document.documentElement.setAttribute("data-nav-variant", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }

  return (
    <div className="fixed bottom-20 left-4 z-[60] hidden items-center gap-1 rounded-base bg-ink-800 p-1 font-mono text-[10px] tracking-[0.08em] text-text-on-dark-2 uppercase shadow-mega lg:flex laptop:hidden">
      <span className="px-2">Nav 1024–1199</span>
      {(["links", "menu"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={variant === v}
          onClick={() => choose(v)}
          className={cn(
            "rounded-base px-2 py-1.5",
            variant === v ? "bg-text-on-dark text-ink-900" : "hover:text-text-on-dark",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
