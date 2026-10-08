"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CMSImage } from "@/components/media/CMSImage";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { useMotion } from "@/components/motion/MotionProvider";
import { ImageWipe, Reveal, SplitHeadline } from "@/components/motion/reveals";
import { profileStore, type ProfileFinish } from "@/components/three/profileStore";
import { Chip } from "@/components/ui/Chip";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

// three.js + R3F live only in this lazy chunk (never in the first load)
const ProfileScene = dynamic(() => import("@/components/three/ProfileScene"), { ssr: false });

type Step = { title?: string | null; text?: string | null };

type Props = {
  eyebrow: string;
  title?: string | null;
  steps: Step[];
  image: SiteImage;
  labels: { finish: string; silver: string; anthracite: string };
};

const STEP_COUNT = 5;

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

/**
 * Systems part A (UI §3.3A, 3D spec). Server HTML = the static layout (render
 * image + the 5 steps as a list), which phones, low-power devices and reduced
 * motion keep. On capable devices the section is pinned (~250vh), the steps
 * follow the scroll progress and the WebGL scene loads 600px before view.
 */
export function ProfileStoryClient({ eyebrow, title, steps, image, labels }: Props) {
  const motion = useMotion();
  const [mode, setMode] = useState<"static" | "scene">("static");
  const [load, setLoad] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [lowFps, setLowFps] = useState(false);
  const [active, setActive] = useState(0);
  const [finish, setFinish] = useState<ProfileFinish>(profileStore.finish);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const decided = useRef(false);

  // Decide once on mount (3D spec: "decide once")
  useEffect(() => {
    if (!motion.ready || decided.current) return;
    decided.current = true;
    if (!canRunScene(motion)) return;
    const id = requestAnimationFrame(() => setMode("scene"));
    return () => cancelAnimationFrame(id);
  }, [motion]);

  // Lazy-load the scene when the section is within 600px; pause it off screen
  useEffect(() => {
    if (mode !== "scene" || !stageRef.current) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "600px" });
    const visible = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    near.observe(stageRef.current);
    visible.observe(stageRef.current);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, [mode]);

  // Pinned scroll timeline: progress 0 → 1 over 250vh, scrub 1
  useGSAP(
    () => {
      if (mode !== "scene" || !pinRef.current) return;
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate() {
          profileStore.set({ progress: proxy.p });
          if (lineRef.current) lineRef.current.style.transform = `scaleY(${proxy.p})`;
          setActive(Math.min(STEP_COUNT - 1, Math.floor(proxy.p * STEP_COUNT)));
        },
      });
      return () => profileStore.set({ progress: 0 });
    },
    { dependencies: [mode], scope: pinRef },
  );

  // Low frame rate: crossfade to the image (400ms), then drop the scene
  const [sceneGone, setSceneGone] = useState(false);
  useEffect(() => {
    if (!lowFps) return;
    const id = window.setTimeout(() => setSceneGone(true), 450);
    return () => window.clearTimeout(id);
  }, [lowFps]);

  const scene = mode === "scene";
  const showCanvas = scene && sceneReady && !lowFps;

  function chooseFinish(next: ProfileFinish) {
    setFinish(next);
    profileStore.set({ finish: next });
  }

  return (
    <div
      ref={pinRef}
      className={cn("grid-12 gap-y-12", scene && "min-h-svh content-center py-(--navbar-h)")}
    >
      <div className="col-span-12 lg:col-span-5">
        <Reveal as="p" y={12} className="font-mono text-eyebrow text-text-on-dark-3 uppercase">
          {eyebrow}
        </Reveal>
        {title && (
          <SplitHeadline as="h2" className="mt-5 text-h2 text-balance">
            {title}
          </SplitHeadline>
        )}

        <div className={cn("relative pl-8", scene ? "mt-10" : "mt-12")}>
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
          <Reveal as="ol" stagger className={cn("flex flex-col", scene ? "gap-6" : "gap-8")}>
            {steps.map((step, i) => (
              <li key={i} aria-current={scene && i === active ? "step" : undefined}>
                <div
                  className={cn(
                    "flex flex-col gap-1.5 transition-opacity duration-300",
                    scene && i !== active && "opacity-35",
                  )}
                >
                  <span className="font-mono text-label text-red-text-on-dark tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative self-start text-h4">
                    {step.title}
                    {/* Step 5: a thin red line draws under the title */}
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
                  {step.text && <p className="max-w-[440px] text-body-s text-text-on-dark-2">{step.text}</p>}
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div ref={stageRef} className="relative" data-cursor={showCanvas ? "scroll" : undefined}>
          <ImageWipe className="rounded-base">
            <div className={cn("transition-opacity duration-[400ms]", showCanvas && "opacity-0")}>
              <CMSImage image={image} ratio="3/2" sizes="(min-width: 1440px) 760px, (min-width: 1024px) 56vw, 100vw" />
            </div>
          </ImageWipe>

          {scene && load && !sceneGone && (
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 transition-opacity duration-[400ms]",
                showCanvas ? "opacity-100" : "opacity-0",
              )}
            >
              <ProfileScene
                active={onScreen && !lowFps}
                onReady={() => setSceneReady(true)}
                onLowFps={() => setLowFps(true)}
              />
            </div>
          )}

          {showCanvas && (
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
              {/* Finish toggle (laptop): silver / anthracite */}
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
