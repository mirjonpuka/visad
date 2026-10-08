"use client";

import { useEffect } from "react";
import { signalHeroIn } from "./heroSignal";
import { CONSTRUCTION_PATH } from "./introPaths";

export const INTRO_KEY = "visad-intro-seen";

/**
 * Runs in <head> before the first paint (Motion §2): marks JS motion as
 * available and decides whether the intro plays (first visit, no reduced
 * motion). Kept tiny and dependency-free.
 */
export const introHeadScript = `(function(){var d=document.documentElement;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('js-motion');if(!localStorage.getItem('${INTRO_KEY}'))d.setAttribute('data-intro','play')}catch(e){}})()`;

// Timeline (seconds), from brand/intro/logo-intro-demo.html
const WIPE_START = 1.75;
const OVERLAY_HIDE = 2.3; // panel fully covers the screen
const WIPE_END = 2.85;

/**
 * Logo intro (Motion §2): the red swoosh draws, V I A D rise from a mask,
 * "CONSTRUCTION" fades in, then a red panel wipes up and off revealing the
 * hero (already rendered underneath, so LCP is not delayed). Any click, key,
 * wheel or touch jumps straight to the wipe. First visit only.
 */
export function IntroOverlay() {
  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") {
      signalHeroIn("short");
      return;
    }
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}

    // The CSS animations started at first paint, possibly long before
    // hydration: read the wipe's real progress instead of starting a fresh clock.
    const wipe = document.querySelector(".intro__wipe");
    const playedMs = Number(wipe?.getAnimations()[0]?.currentTime ?? 0);
    const mountedAt = performance.now();
    const elapsed = () => playedMs / 1000 + (performance.now() - mountedAt) / 1000;

    const timers: number[] = [];
    /** `untilWipe`: seconds from now until the red wipe starts (≤ 0 = already started) */
    const schedule = (untilWipe: number) => {
      timers.forEach(window.clearTimeout);
      timers.length = 0;
      timers.push(
        window.setTimeout(() => signalHeroIn("full"), Math.max(0, untilWipe + OVERLAY_HIDE - WIPE_START) * 1000),
        window.setTimeout(() => {
          html.dataset.intro = "done";
        }, Math.max(0, untilWipe + WIPE_END - WIPE_START) * 1000),
      );
    };
    schedule(WIPE_START - elapsed());

    function skip() {
      if (elapsed() >= WIPE_START) return; // already wiping
      html.dataset.intro = "skip"; // CSS restarts the wipe (and the hide timings) right now
      schedule(0);
      remove();
    }
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const remove = () => events.forEach((e) => window.removeEventListener(e, skip));
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));

    return () => {
      remove();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <div className="intro" aria-hidden>
      <div className="intro__stage">
        <svg viewBox="0 0 1280 500" className="intro__logo">
          <defs>
            <clipPath id="intro-swoosh-clip">
              <path d="M0 500L22 418V0H1282L1262 82V500Z" />
            </clipPath>
            <clipPath id="intro-letters-clip">
              <rect x="0" y="110" width="1280" height="290" />
            </clipPath>
          </defs>
          <path
            className="intro__swoosh"
            pathLength={1}
            d="M-20 460H430Q482 460 505 400L615 110Q642 40 700 40H1300"
            clipPath="url(#intro-swoosh-clip)"
          />
          <g clipPath="url(#intro-letters-clip)">
            <path className="intro__letter intro__l1" d="M10 110H90L170 310L250 110H320L210 400H120Z" />
            <path className="intro__letter intro__l2" d="M350 110H430V400H350Z" />
            <path
              className="intro__letter intro__l3"
              fillRule="evenodd"
              d="M730 110H830L940 400H750L732 360H712L700 400H620ZM780 200L822 330H732Z"
            />
            <path
              className="intro__letter intro__l4"
              fillRule="evenodd"
              d="M960 110H1135C1200 110 1230 150 1230 215V300C1230 365 1195 400 1130 400H960ZM1040 180H1105C1135 180 1150 200 1150 230V285C1150 312 1135 330 1100 330H1040Z"
            />
          </g>
          <path className="intro__sub" d={CONSTRUCTION_PATH} />
        </svg>
      </div>
      <div className="intro__wipe" />
    </div>
  );
}
