"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { EASE, gsap } from "./gsap";
import { signalHeroIn } from "./heroSignal";
import { useLenis } from "./LenisProvider";
import { useMotion } from "./MotionProvider";
import { useRouteChange } from "./routeEvents";

const LEAVE = 0.45;
const ENTER = 0.55;

/** Internal page navigation we animate (same origin, normal click, not a file/new tab/locale switch) */
function transitionTarget(event: MouseEvent): { href: string; title: string } | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return null;
  const a = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
  if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("hreflang")) return null;
  if (a.dataset.transition === "off") return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return null;
  if (/^\/(studio|api)(\/|$)/.test(url.pathname)) return null;
  if (url.pathname === location.pathname) return null; // same page / hash links scroll normally
  const title =
    a.dataset.title ?? a.getAttribute("aria-label") ?? a.textContent?.replace(/[→↗]/g, "").trim().split("\n")[0] ?? "";
  return { href: url.pathname + url.search + url.hash, title: title.slice(0, 60) };
}

/**
 * Page transitions (Motion §3). Every internal link click: an ink-900 panel
 * with a 2px red edge slides up (450ms) while the page lifts 40px and dims;
 * the destination name rises in the panel; we navigate while covered, reset
 * scroll, then the panel continues up and off (550ms) and the new hero
 * enters. Back/forward: 250ms crossfade. Reduced motion: 150ms crossfade.
 * Works with every existing <Link>, no special link component needed.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const lenis = useLenis();
  const { reducedMotion } = useMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [title, setTitle] = useState("");
  const pending = useRef<{ from: string; covered: Promise<void> } | null>(null);
  const popping = useRef(false);
  /** Pathname of the page on screen (updated on every route change) */
  const shownPath = useRef<string | null>(null);
  useEffect(() => {
    shownPath.current = location.pathname;
  }, []);

  // Intercept clicks before next/link handles them (capture phase)
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = transitionTarget(event);
      if (!target || pending.current) return;
      event.preventDefault(); // next/link skips navigation when default is prevented

      const main = document.getElementById("main");
      if (reducedMotion || !panelRef.current) {
        if (main) gsap.to(main, { opacity: 0, duration: 0.15, ease: "none" });
        pending.current = { from: location.pathname, covered: Promise.resolve() };
        window.setTimeout(() => router.push(target.href), 150);
        return;
      }

      setTitle(target.title);
      // The next page's hero waits until the panel lifts
      delete document.documentElement.dataset.heroIn;
      // From now on heroes enter with GSAP when the panel lifts, not with CSS under the panel
      document.documentElement.classList.remove("hero-css");
      const covered = new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.set(panelRef.current, { yPercent: 100, visibility: "visible" })
          .to(panelRef.current, { yPercent: 0, duration: LEAVE, ease: EASE.inOutQuart })
          .fromTo(
            titleRef.current,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.6, ease: EASE.outExpo },
            0.15,
          );
        if (main) tl.to(main, { y: -40, opacity: 0.6, duration: LEAVE, ease: EASE.inOutQuart }, 0);
      });
      pending.current = { from: location.pathname, covered };
      covered.then(() => router.push(target.href));
    }
    function onPopState() {
      // Back/forward between query states of the same page (project filters)
      // is not a route change: only flag real page changes
      popping.current = location.pathname !== shownPath.current;
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [router, reducedMotion]);

  // Route changed: reset scroll while covered, then reveal
  useRouteChange(() => {
    shownPath.current = location.pathname;
    const main = document.getElementById("main");
    const state = pending.current;

    if (popping.current) {
      popping.current = false;
      if (main) gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: reducedMotion ? 0.15 : 0.25, ease: "none" });
      return;
    }
    if (!state) return;
    pending.current = null;

    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);

    if (reducedMotion || !panelRef.current) {
      if (main) gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none", clearProps: "opacity" });
      return;
    }
    state.covered.then(() => {
      // Let the new page paint (its skeleton shows under the panel if still loading)
      requestAnimationFrame(() => {
        if (main) gsap.set(main, { clearProps: "transform,opacity" });
        signalHeroIn("short");
        gsap.to(panelRef.current, {
          yPercent: -100,
          duration: ENTER,
          ease: EASE.inOutQuart,
          onComplete: () => {
            gsap.set(panelRef.current, { visibility: "hidden", yPercent: 100 });
            setTitle("");
          },
        });
      });
    });
  });

  return (
    <>
      {children}
      <div
        ref={panelRef}
        aria-hidden
        className="invisible fixed inset-0 z-[80] flex items-center justify-center border-t-2 border-red-500 bg-ink-900"
      >
        <span className="block overflow-hidden px-6 text-center">
          <span ref={titleRef} className="block text-h2 text-text-on-dark">
            {title}
          </span>
        </span>
      </div>
    </>
  );
}
