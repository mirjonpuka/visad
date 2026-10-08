"use client";

import { useRef, useState } from "react";
import { CMSImage } from "@/components/media/CMSImage";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { useMotion } from "@/components/motion/MotionProvider";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type Step = { title: string; text?: string | null; image: SiteImage | null };

/**
 * Factory process (UI §8.3, Motion §4.9): on laptop a pinned section whose
 * panels move horizontally (scrub 1) over (panels − 1) × 100vw of scroll; the
 * centred panel's image scales slightly. Phone, touch and reduced motion: a
 * plain vertical list (server HTML is the list, upgraded after mount).
 */
export function FactoryProcess({ title, steps }: { title: string; steps: Step[] }) {
  const { ready, isLaptop, reducedMotion } = useMotion();
  const horizontal = ready && isLaptop && !reducedMotion && steps.length > 1;
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!horizontal || !root.current || !track.current) return;
      const el = track.current;
      const distance = () => el.scrollWidth - window.innerWidth;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.round(self.progress * (steps.length - 1))),
        },
      });
    },
    { dependencies: [horizontal, steps.length], scope: root },
  );

  return (
    <section ref={root} className={cn("surface-light overflow-hidden", horizontal ? "flex h-svh flex-col justify-center" : "section-y")}>
      <div className="site-container">
        <h2 className="text-h2">{title}</h2>
      </div>
      <ol
        ref={track}
        className={cn(
          horizontal ? "mt-12 flex w-max gap-16 pr-[var(--gutter)] pl-[var(--gutter)]" : "site-container mt-12 flex flex-col gap-16",
        )}
      >
        {steps.map((step, i) => (
          <li
            key={i}
            className={cn(
              "grid gap-8",
              horizontal ? "w-[min(1100px,80vw)] grid-cols-[5fr_7fr] items-center" : "md:grid-cols-2 md:items-center",
            )}
          >
            <div>
              <span
                className={cn(
                  "block font-mono text-[clamp(64px,8vw,128px)] leading-none tracking-[-0.04em] tabular transition-colors duration-500",
                  horizontal && active !== i ? "text-text-on-light-3" : "text-red-700",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-h3">{step.title}</h3>
              {step.text && <p className="mt-3 max-w-[420px] text-body text-text-on-light-2">{step.text}</p>}
            </div>
            <div className="overflow-hidden rounded-base">
              <div
                className={cn(
                  "transition-transform duration-[1200ms] ease-out-expo",
                  horizontal && active === i ? "scale-[1.04]" : "scale-100",
                )}
              >
                <CMSImage image={step.image} ratio="4/3" sizes="(min-width: 1200px) 50vw, (min-width: 768px) 50vw, 100vw" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
