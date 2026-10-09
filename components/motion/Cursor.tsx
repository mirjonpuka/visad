"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { gsap } from "./gsap";
import { useMotion } from "./MotionProvider";

type Mode = "dot" | "ring" | "view" | "drag" | "scroll" | "hidden";

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor="ring"]';
const TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"]';

/**
 * Custom cursor (Motion §5.4), laptop with a fine pointer only:
 * 8px white dot (difference blend) → 40px ring over links/buttons →
 * 88px solid circle with "SHIKO" over project tiles / gallery images
 * ([data-cursor="view"]), "TËRHIQ" on carousels ([data-cursor="drag"]),
 * "SCROLL" on the 3D canvas ([data-cursor="scroll"]). Native cursor stays
 * for text fields; hidden when the pointer leaves the window.
 */
export function Cursor() {
  const t = useTranslations("cursor");
  const { isLaptop, reducedMotion, ready } = useMotion();
  const enabled = ready && isLaptop && !reducedMotion;
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("hidden");

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    document.documentElement.classList.add("has-cursor");
    const xTo = gsap.quickTo(el, "x", { duration: 0.15, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.15, ease: "power3.out" });
    let current: Mode = "hidden";
    const set = (next: Mode) => {
      if (next !== current) {
        current = next;
        setMode(next);
      }
    };

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      xTo(event.clientX);
      yTo(event.clientY);
      const target = event.target as Element | null;
      const special = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      if (target?.closest(TEXT_FIELDS)) set("hidden");
      else if (special === "view" || special === "drag" || special === "scroll") set(special);
      else if (target?.closest(INTERACTIVE)) set("ring");
      else set("dot");
    }
    const onLeave = () => set("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const label = mode === "view" ? t("view") : mode === "drag" ? t("drag") : mode === "scroll" ? "Scroll" : "";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90]"
      style={{ transform: "translate(-100px, -100px)" }}
    >
      <div
        className={cn(
          "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
          "[transition:width_300ms_var(--ease-out-expo),height_300ms_var(--ease-out-expo),background-color_250ms,border-color_250ms,opacity_200ms]",
          mode === "hidden" && "h-2 w-2 opacity-0",
          // Red dot with a thin white halo: visible on white, dark and photo backgrounds alike
          mode === "dot" && "h-2.5 w-2.5 bg-red-500 shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]",
          mode === "ring" &&
            "h-10 w-10 border-2 border-red-500 bg-red-500/10 shadow-[0_0_0_1px_rgba(255,255,255,0.6)]",
          (mode === "view" || mode === "drag" || mode === "scroll") && "h-[88px] w-[88px] bg-[rgba(14,15,17,0.85)]",
        )}
      >
        {label && (
          <span className="font-mono text-label tracking-[0.12em] text-white uppercase">{label}</span>
        )}
      </div>
    </div>
  );
}
