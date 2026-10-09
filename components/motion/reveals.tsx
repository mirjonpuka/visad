"use client";

import { useRef, type ReactNode } from "react";
import { cn, htmlRef, type HtmlTag } from "@/lib/utils";
import { afterIdle, EASE, ENTER_START, gsap, SplitText, useGSAP } from "./gsap";
import { onHeroIn } from "./heroSignal";
import { useMotion } from "./MotionProvider";

/*
 * Scroll reveals (Motion §4). Every element starts visible in the server
 * HTML; `html.js-motion [data-anim]` hides it until GSAP takes over (with a 3s
 * CSS safety net), so there is no flash and no content lost if JS fails.
 * Reduced motion: no movement, content simply visible.
 */

type Common = { className?: string; children: ReactNode };

/** Mark an element as handled: GSAP now owns its visibility */
function release(el: Element | null) {
  if (el) gsap.set(el, { visibility: "visible" });
}

/** §4.1 Headline: lines rise from masks (900ms expo.out, 90ms stagger). Re-splits on resize. */
export function SplitHeadline({
  as: Tag = "h2",
  className,
  children,
  delay = 0,
  /** "scroll" = on enter; "manual" = waits for a `visad:hero-in` event (hero) */
  trigger = "scroll",
}: Common & { as?: HtmlTag; delay?: number; trigger?: "scroll" | "manual" }) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, ready } = useMotion();

  useGSAP(
    (_, contextSafe) => {
      if (!ready || !ref.current) return;
      const el = ref.current;
      if (reducedMotion) return release(el);
      // Hero headline on a full page load: CSS animates it ("hero-css" in globals.css)
      if (trigger === "manual" && document.documentElement.classList.contains("hero-css")) return release(el);
      let tween: gsap.core.Tween | undefined;
      let split: SplitText | undefined;
      let done = false;
      let stop: (() => void) | undefined;
      const setup = () => {
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          // Masks get "split-line-mask": extra room for descenders and ç / ë marks
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            release(el);
            // Already revealed: a later re-split (resize) stays static
            if (done) return;
            tween?.kill();
            tween = gsap.from(self.lines, {
              // 130%: the lines start below the mask's extra accent room, so no
              // letter tops show there at the first frame (iOS Safari kept those
              // as ghost fragments under the heading — A1)
              yPercent: 130,
              duration: 0.9,
              ease: EASE.outExpo,
              stagger: 0.09,
              delay,
              paused: trigger === "manual",
              scrollTrigger: trigger === "scroll" ? { trigger: el, start: ENTER_START, once: true } : undefined,
              // Done: back to the plain heading, nothing clipped any more (accents, descenders)
              onComplete: () => {
                done = true;
                split?.revert();
              },
            });
            return tween;
          },
        });
        stop = trigger === "manual" ? onHeroIn(() => tween?.play()) : undefined;
      };
      // Hero headlines immediately; scroll reveals when the browser is idle
      const cancel = trigger === "scroll" ? afterIdle(contextSafe!(setup)) : (setup(), undefined);
      return () => {
        cancel?.();
        stop?.();
        split?.revert();
      };
    },
    { dependencies: [ready, reducedMotion], scope: ref },
  );

  return (
    <Tag
      ref={htmlRef(ref)}
      className={className}
      data-anim=""
      data-hero-title={trigger === "manual" ? "" : undefined}
    >
      {children}
    </Tag>
  );
}

/** §4.2 Fade + rise (700ms, 24px). `stagger` animates direct children 60ms apart. */
export function Reveal({
  as: Tag = "div",
  className,
  children,
  stagger = false,
  delay = 0,
  y = 24,
}: Common & { as?: HtmlTag; stagger?: boolean; delay?: number; y?: number }) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion, ready } = useMotion();

  useGSAP(
    (_, contextSafe) => {
      if (!ready || !ref.current) return;
      const el = ref.current;
      if (reducedMotion) return release(el);
      return afterIdle(
        contextSafe!(() => {
          release(el);
          gsap.from(stagger ? el.children : el, {
            autoAlpha: 0,
            y,
            duration: 0.7,
            ease: EASE.outExpo,
            stagger: stagger ? 0.06 : 0,
            delay,
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
          });
        }),
      );
    },
    { dependencies: [ready, reducedMotion], scope: ref },
  );

  return (
    <Tag ref={htmlRef(ref)} className={className} data-anim="">
      {children}
    </Tag>
  );
}

/**
 * §4.3 Image wipe: clip-path inset(100% 0 0 0) → inset(0) in 1.1s
 * (power4.inOut) while the image inside scales 1.15 → 1. `index` staggers grids by 80ms.
 */
export function ImageWipe({ className, children, index = 0 }: Common & { index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, ready } = useMotion();

  useGSAP(
    (_, contextSafe) => {
      if (!ready || !ref.current) return;
      const el = ref.current;
      if (reducedMotion) return release(el);
      return afterIdle(
        contextSafe!(() => {
          release(el);
          const img = el.querySelector("img");
          const tl = gsap.timeline({
            delay: index * 0.08,
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
          });
          tl.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE.inOutQuart, clearProps: "clipPath" },
          );
          if (img) tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.1, ease: EASE.inOutQuart }, 0);
        }),
      );
    },
    { dependencies: [ready, reducedMotion], scope: ref },
  );

  return (
    <div ref={ref} className={className} data-anim="">
      {children}
    </div>
  );
}

/**
 * §4.4 Parallax: content moves -`amount`% → +`amount`% while the parent
 * scrolls through the viewport (scrub). Off on touch devices and with reduced motion.
 */
export function Parallax({
  className,
  children,
  amount = 8,
  darken = false,
}: Common & { amount?: number; darken?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion, isTouch, ready } = useMotion();

  useGSAP(
    (_, contextSafe) => {
      if (!ready || reducedMotion || isTouch || !ref.current) return;
      const el = ref.current;
      const trigger = el.parentElement ?? el;
      return afterIdle(
        contextSafe!(() => {
          gsap.fromTo(
            el,
            { yPercent: -amount },
            { yPercent: amount, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true } },
          );
          if (darken) {
            gsap.to(el, {
              filter: "brightness(0.7)",
              ease: "none",
              scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
            });
          }
        }),
      );
    },
    { dependencies: [ready, reducedMotion, isTouch], scope: ref },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/** §4.8 Hairline drawing left → right (scaleX 0 → 1, 1.1s) when it enters. */
export function DrawLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion, ready } = useMotion();

  useGSAP(
    (_, contextSafe) => {
      if (!ready || !ref.current) return;
      const el = ref.current;
      if (reducedMotion) return release(el);
      return afterIdle(
        contextSafe!(() => {
          release(el);
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.1,
            ease: EASE.inOutQuart,
            delay,
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        }),
      );
    },
    { dependencies: [ready, reducedMotion], scope: ref },
  );

  return <span ref={ref} aria-hidden data-anim="" className={cn("block", className)} />;
}

/**
 * §4.6 Count-up from 0 in 1.6s (expo.out), keeping prefix/suffix ("9500+").
 * The final value is in the HTML; tabular numbers keep the width steady.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion, ready } = useMotion();
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);

  useGSAP(
    (_, contextSafe) => {
      if (!ready || reducedMotion || !match || !ref.current) return;
      const el = ref.current;
      const [, prefix, digits, suffix] = match;
      const target = Number(digits.replace(",", "."));
      const counter = { n: 0 };
      return afterIdle(
        contextSafe!(() => {
          el.textContent = `${prefix}0${suffix}`;
          gsap.to(counter, {
            n: target,
            duration: 1.6,
            ease: EASE.outExpo,
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
            onUpdate: () => {
              el.textContent = `${prefix}${Math.round(counter.n)}${suffix}`;
            },
            onComplete: () => {
              el.textContent = value;
            },
          });
        }),
      );
    },
    { dependencies: [ready, reducedMotion, value], scope: ref },
  );

  return (
    <>
      <span ref={ref} aria-hidden className={cn("tabular", className)}>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
