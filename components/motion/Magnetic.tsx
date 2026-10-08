"use client";

import { useEffect } from "react";
import { gsap } from "./gsap";
import { useMotion } from "./MotionProvider";

const RADIUS = 80;

/**
 * Magnetic buttons (Motion §5.2), laptop + fine pointer only. Every
 * [data-magnetic] element (large buttons, WhatsApp FAB) follows the cursor
 * within an 80px radius: the element moves 30% of the distance, its label
 * 15% for depth. Returns with power3.out (no elastic).
 */
export function Magnetic() {
  const { isLaptop, reducedMotion, ready } = useMotion();

  useEffect(() => {
    if (!ready || !isLaptop || reducedMotion) return;

    type Item = {
      el: HTMLElement;
      x: gsap.QuickToFunc;
      y: gsap.QuickToFunc;
      lx?: gsap.QuickToFunc;
      ly?: gsap.QuickToFunc;
      active: boolean;
    };
    let items: Item[] = [];
    const collect = () => {
      items = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")).map((el) => {
        const label = el.querySelector<HTMLElement>(".btn__label");
        const opts = { duration: 0.4, ease: "power3.out" };
        return {
          el,
          x: gsap.quickTo(el, "x", opts),
          y: gsap.quickTo(el, "y", opts),
          lx: label ? gsap.quickTo(label, "x", opts) : undefined,
          ly: label ? gsap.quickTo(label, "y", opts) : undefined,
          active: false,
        };
      });
    };
    collect();
    const observer = new MutationObserver(() => collect());
    observer.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    let px = -1;
    let py = -1;
    const update = () => {
      frame = 0;
      for (const item of items) {
        const r = item.el.getBoundingClientRect();
        if (!r.width) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        const near = Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS;
        if (near) {
          item.active = true;
          item.x(dx * 0.3);
          item.y(dy * 0.3);
          item.lx?.(dx * 0.15);
          item.ly?.(dy * 0.15);
        } else if (item.active) {
          item.active = false;
          gsap.to(item.el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
          const label = item.el.querySelector(".btn__label");
          if (label) gsap.to(label, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
        }
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      px = event.clientX;
      py = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      observer.disconnect();
      cancelAnimationFrame(frame);
      items.forEach((item) => gsap.set([item.el, item.el.querySelector(".btn__label")].filter(Boolean), { x: 0, y: 0 }));
    };
  }, [ready, isLaptop, reducedMotion]);

  return null;
}
