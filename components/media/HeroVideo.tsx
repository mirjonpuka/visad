"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";

/**
 * Optional muted looping hero video (UI §3.1), layered over the hero image
 * (which stays as poster and LCP). Mounted only after the page has loaded, and
 * never with reduced motion, Save-Data or on low-power devices (Motion §1).
 * Fades in once it can play; pauses while the hero is off screen.
 */
export function HeroVideo({ src }: { src: string }) {
  const { ready, reducedMotion, isLowPower } = useMotion();
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const allowed = ready && !reducedMotion && !isLowPower;

  useEffect(() => {
    if (!allowed) return;
    const start = () => setMounted(true);
    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 300);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [allowed]);

  useEffect(() => {
    const video = ref.current;
    if (!mounted || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [mounted]);

  if (!allowed || !mounted) return null;
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}
