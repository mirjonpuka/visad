/**
 * Shared state between the pinned section (ScrollTrigger, main bundle) and the
 * lazy 3D scene (3D spec §Tech). Plain module, no three.js imports, so the
 * section can write to it without pulling the scene into the first load.
 * The scene reads `progress` in useFrame (no React re-render per frame).
 */
type Listener = () => void;

export type ProfileFinish = "silver" | "anthracite";

export const profileStore = {
  /** Scroll progress through the pinned section, 0 → 1 */
  progress: 0,
  finish: "silver" as ProfileFinish,
  listeners: new Set<Listener>(),
  set(patch: Partial<{ progress: number; finish: ProfileFinish }>) {
    Object.assign(this, patch);
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
};

/** 0 → 1 between a and b (clamped), smoothstep eased. */
export function ramp(p: number, a: number, b: number) {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
