"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { useMotion } from "@/components/motion/MotionProvider";
import { Reveal, SplitHeadline } from "@/components/motion/reveals";
import { profileStore, ramp, type ProfileFinish } from "@/components/three/profileStore";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

// three.js + R3F live only in this lazy chunk (never in the first load)
const WindowScene = dynamic(() => import("@/components/three/WindowScene"), { ssr: false });

type Step = { title?: string | null; text?: string | null };

type Props = {
  eyebrow: string;
  title?: string | null;
  steps: Step[];
  /** Still render of the same scene, transparent background */
  poster: { src: string; alt: string };
  labels: { finish: string; silver: string; anthracite: string };
};

const STEP_COUNT = 5;

/** Navbar height in px (CSS --navbar-h) for the pin start */
function navbarHeight() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-h")) || 76;
}
const FEATHER =
  "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)";
/** Phone backdrop: soft top and bottom edges into the section */
const FEATHER_Y = "linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)";
/** Remounts after a lost WebGL context before falling back to the still image */
const MAX_RECOVERIES = 3;

/** WebGL2 + capable device + no reduced motion + ≥768px fine pointer (3D spec §Fallbacks). */
function canRunScene(flags: ReturnType<typeof useMotion>) {
  if (flags.reducedMotion || flags.isTouch || flags.isLowPower) return false;
  if (window.innerWidth < 768) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/** Phones / touch (owner): the window opens behind the text unless low power or reduced motion. */
function canRunBackdrop(flags: ReturnType<typeof useMotion>) {
  if (flags.reducedMotion) return false;
  // Not flags.isLowPower: iOS Safari always reports 4 CPU cores, which excluded every iPhone.
  // Only Save-Data and very little memory (Android, ≤2GB) keep the still image.
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData || (nav.deviceMemory ?? 8) <= 2) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Systems part A (UI §3.3A, owner feedback): a window is built, opens, and
 * the camera flies out through it as the visitor scrolls the pinned section
 * (300vh, scrubbed both ways). Server HTML = the still render + the 5 steps
 * as a list, which phones, low-power devices and reduced motion keep.
 */
export function ProfileStoryClient({ eyebrow, title, steps, poster, labels }: Props) {
  const motion = useMotion();
  // scene = pinned desktop story; backdrop = phone: closed window opens and the camera flies
  // through it behind the text while the section scrolls by; static = still image only
  const [mode, setMode] = useState<"static" | "scene" | "backdrop">("static");
  const [load, setLoad] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [recoveries, setRecoveries] = useState(0);
  const [active, setActive] = useState(0);
  const [finish, setFinish] = useState<ProfileFinish>(profileStore.finish);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const decided = useRef(false);

  // Decide once on mount (3D spec: "decide once")
  useEffect(() => {
    if (!motion.ready || decided.current) return;
    decided.current = true;
    const next = canRunScene(motion) ? "scene" : canRunBackdrop(motion) ? "backdrop" : null;
    if (!next) return;
    const id = requestAnimationFrame(() => setMode(next));
    return () => cancelAnimationFrame(id);
  }, [motion]);

  // Load the scene within 600px of the section, after the visitor started scrolling
  useEffect(() => {
    const target = mode === "backdrop" ? pinRef.current : stageRef.current;
    if (mode === "static" || !target) return;
    let isNear = false;
    let scrolled = window.scrollY > 0;
    const maybeLoad = () => isNear && scrolled && setLoad(true);
    const onScroll = () => {
      scrolled = true;
      maybeLoad();
    };
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    const near = new IntersectionObserver(
      ([e]) => {
        isNear = e.isIntersecting;
        maybeLoad();
      },
      { rootMargin: "600px" },
    );
    const visible = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    near.observe(target);
    visible.observe(target);
    return () => {
      window.removeEventListener("scroll", onScroll);
      near.disconnect();
      visible.disconnect();
    };
  }, [mode]);

  // Pinned scroll timeline: progress 0 → 1 over 300vh, scrub 1 (works up and down)
  useGSAP(
    () => {
      if (mode !== "scene" || !pinRef.current) return;
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          // Owner brief C3: the pin starts when the section reaches the bottom of the navbar
          start: () => `top ${navbarHeight()}px`,
          end: "+=300%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          profileStore.set({ progress: proxy.p });
          if (lineRef.current) lineRef.current.style.transform = `scaleY(${proxy.p})`;
          // The fly-through ends in the section colour, so the next section follows seamlessly
          if (fadeRef.current) fadeRef.current.style.opacity = String(ramp(proxy.p, 0.88, 0.95));
          setActive(Math.min(STEP_COUNT - 1, Math.floor(proxy.p * STEP_COUNT)));
        },
      });
      return () => profileStore.set({ progress: 0 });
    },
    { dependencies: [mode], scope: pinRef },
  );

  // Phone backdrop: no pin. While the text scrolls by, the finished (closed) window opens and the
  // camera flies through it — the last part of the desktop timeline (0.7 → 0.98), scrubbed both ways
  useGSAP(
    () => {
      if (mode !== "backdrop" || !pinRef.current) return;
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: pinRef.current, start: "top 70%", end: "bottom 30%", scrub: 1 },
        onUpdate() {
          profileStore.set({ progress: 0.7 + 0.28 * proxy.p });
          if (fadeRef.current) fadeRef.current.style.opacity = String(ramp(proxy.p, 0.85, 1));
        },
      });
      profileStore.set({ progress: 0.7 });
      return () => profileStore.set({ progress: 0 });
    },
    { dependencies: [mode], scope: pinRef },
  );

  // Lost WebGL context (GPU reset): remount the canvas a few times
  function onContextLost() {
    setSceneReady(false);
    window.setTimeout(() => setRecoveries((n) => n + 1), 400);
  }

  const scene = mode === "scene";
  const backdrop = mode === "backdrop";
  const sceneAlive = (scene || backdrop) && load && recoveries <= MAX_RECOVERIES;
  const showCanvas = sceneAlive && sceneReady;

  function chooseFinish(next: ProfileFinish) {
    setFinish(next);
    profileStore.set({ finish: next });
  }

  return (
    <div
      ref={pinRef}
      data-profile-scene={scene || undefined}
      className={cn(
        "grid-12 gap-y-12",
        // One screen below the navbar: text column and canvas share the full height
        scene && "h-[calc(100svh-var(--navbar-h))] min-h-[560px] items-stretch py-6",
        backdrop && "relative isolate py-16",
      )}
    >
      {/* Phone: the window opens behind the text, always under a dark shade so the text reads */}
      {backdrop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden"
          style={{ maskImage: FEATHER_Y, WebkitMaskImage: FEATHER_Y }}
        >
          {sceneAlive && (
            <div
              className={cn(
                "ease-out absolute inset-0 transition-opacity duration-[400ms]",
                showCanvas ? "opacity-100" : "opacity-0",
              )}
            >
              <WindowScene
                key={recoveries}
                active={onScreen}
                dpr={1}
                onReady={() => setSceneReady(true)}
                onContextLost={onContextLost}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-ink-900/75" />
          <div ref={fadeRef} className="absolute inset-0 bg-ink-900 opacity-0" />
        </div>
      )}

      <div className="col-span-12 flex flex-col justify-center lg:col-span-5">
        <Reveal as="p" y={12} className="font-mono text-eyebrow text-text-on-dark-3 uppercase">
          {eyebrow}
        </Reveal>
        {title && (
          <SplitHeadline
            as="h2"
            className={cn(
              "text-balance",
              scene ? "mt-4 text-[clamp(30px,2.9vw,46px)] leading-[1.05] tracking-[-0.02em]" : "mt-5 text-h2",
            )}
          >
            {title}
          </SplitHeadline>
        )}

        <div className={cn("relative pl-8", scene ? "mt-6 laptop:mt-8" : "mt-12")}>
          {/* Vertical progress line; red fill follows the scroll progress */}
          <span aria-hidden className="absolute top-1 bottom-1 left-0 w-px bg-line-dark">
            {scene && (
              <span
                ref={lineRef}
                className="absolute inset-0 origin-top bg-red-500"
                style={{ transform: "scaleY(0)" }}
              />
            )}
          </span>
          <Reveal as="ol" stagger className={cn("flex flex-col", scene ? "gap-3.5 laptop:gap-4" : "gap-6")}>
            {steps.map((step, i) => (
              <li key={i} aria-current={scene && i === active ? "step" : undefined}>
                {/* Compact (owner brief C3): number beside the title, 18–20px titles, 14px text */}
                <div
                  className={cn(
                    "grid grid-cols-[30px_1fr] items-baseline gap-x-2 transition-opacity duration-300",
                    scene && i !== active && "opacity-35",
                  )}
                >
                  <span className="font-mono text-label text-red-text-on-dark tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative self-start justify-self-start text-[18px] leading-[1.25] font-medium laptop:text-[20px]">
                    {step.title}
                    {scene && i === STEP_COUNT - 1 && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -bottom-1 left-0 h-px w-full origin-left bg-red-500 transition-transform duration-700 ease-out-expo",
                          active === i ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    )}
                  </h3>
                  {step.text && (
                    <p className="col-start-2 mt-1 max-w-[440px] text-[14px] leading-[1.45] text-text-on-dark-2">
                      {step.text}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>

      {/* The still image column: desktop scene stage, or phones without the backdrop */}
      <div className={cn("col-span-12 flex items-center lg:col-span-7", backdrop && "hidden")}>
        {/* No box, no border: the scene's wall and the poster share the section colour */}
        <div
          ref={stageRef}
          className={cn(
            "relative mx-auto w-full max-w-[640px]",
            scene ? "h-full min-h-[420px]" : "aspect-[4/5] max-h-[78svh]",
          )}
          data-cursor={showCanvas ? "scroll" : undefined}
        >
          <Image
            src={poster.src}
            alt={poster.alt}
            fill
            sizes="(min-width: 1440px) 640px, (min-width: 1024px) 50vw, 100vw"
            // Hidden as soon as the scene loads (it shows the finished window, glass included, which
            // gave the story away); it comes back only if WebGL gives up
            className={cn("object-contain transition-opacity duration-[400ms]", sceneAlive && "opacity-0")}
          />

          {scene && sceneAlive && (
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 transition-opacity duration-[400ms]",
                showCanvas ? "opacity-100" : "opacity-0",
              )}
              // Feathered edges: the daylight of the fly-through dissolves into the page, no hard box
              style={{
                maskImage: FEATHER,
                WebkitMaskImage: FEATHER,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              <WindowScene
                key={recoveries}
                active={onScreen}
                onReady={() => setSceneReady(true)}
                onContextLost={onContextLost}
              />
            </div>
          )}
          {scene && (
            <div
              ref={fadeRef}
              aria-hidden
              className="pointer-events-none absolute -inset-px bg-ink-900 opacity-0"
            />
          )}

          {scene && showCanvas && (
            <>
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute right-4 bottom-4 font-mono text-label text-text-on-dark-2 uppercase transition-opacity duration-500",
                  active === STEP_COUNT - 1 ? "opacity-100" : "opacity-0",
                )}
              >
                VISAD × ALUMIL
              </span>
              <div
                role="group"
                aria-label={labels.finish}
                className="absolute top-4 right-4 hidden gap-2 laptop:flex"
              >
                {(["silver", "anthracite"] as const).map((value) => (
                  <Chip key={value} active={finish === value} onClick={() => chooseFinish(value)}>
                    {labels[value]}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
