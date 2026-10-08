import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/*
 * Skeletons (UI §13.2). Colours come from the surrounding .surface-dark /
 * .surface-light section (ink-700 + ink-600 shimmer / alu-200 + alu-300).
 * Sizes mirror the final components so nothing moves when content arrives.
 */

type BaseProps = { className?: string; style?: CSSProperties };

export function Skeleton({ className, style }: BaseProps) {
  return <div aria-hidden className={cn("skeleton", className)} style={style} />;
}

// Deterministic "random" widths (70–95%) so server and client render the same
const WIDTHS = [92, 78, 88, 73, 95, 81, 70, 86];

export function SkeletonText({
  lines = 3,
  size = 16,
  className,
}: BaseProps & { lines?: number; size?: 12 | 16 }) {
  return (
    <div aria-hidden className={cn("flex flex-col", size === 16 ? "gap-[10px]" : "gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          style={{
            height: size,
            width: `${i === lines - 1 && lines > 1 ? WIDTHS[i % 8] - 22 : WIDTHS[i % 8]}%`,
          }}
        />
      ))}
    </div>
  );
}

/** Title bars sized in em of the given type token, so line boxes match the real heading. */
export function SkeletonTitle({
  lines = 1,
  token = "h2",
  className,
}: BaseProps & { lines?: number; token?: "display-xl" | "display-l" | "h1" | "h2" | "h3" | "h4" }) {
  const tokenClass = {
    "display-xl": "text-display-xl",
    "display-l": "text-display-l",
    h1: "text-h1",
    h2: "text-h2",
    h3: "text-h3",
    h4: "text-h4",
  }[token];
  return (
    <div aria-hidden className={cn(tokenClass, className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="flex h-[1lh] items-center">
          <Skeleton className="h-[0.78em]" style={{ width: `${i === lines - 1 ? 58 : WIDTHS[i % 8]}%` }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonImage({ ratio = "16/10", className }: BaseProps & { ratio?: string }) {
  return <Skeleton className={cn("w-full min-w-0", className)} style={{ aspectRatio: ratio }} />;
}

/** Project tile: full-bleed image with title + meta bars bottom-left. */
export function SkeletonTile({ className, style }: BaseProps) {
  return (
    <div
      aria-hidden
      className={cn("skeleton relative h-full min-h-[320px] w-full min-w-0", className)}
      style={style}
    >
      <div className="absolute bottom-6 left-6 flex w-1/2 flex-col gap-2.5">
        <div className="h-[18px] w-4/5 rounded-base bg-(--sk-hi)" />
        <div className="h-3 w-3/5 rounded-base bg-(--sk-hi)" />
      </div>
    </div>
  );
}

/** Solution / series card: 4:5 image, title, one line, link. */
export function SkeletonCard({ ratio = "4/5", className }: BaseProps & { ratio?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col", className)}>
      <SkeletonImage ratio={ratio} />
      <SkeletonTitle token="h4" className="mt-5" />
      <SkeletonText lines={1} size={12} className="mt-2" />
      <Skeleton className="mt-4 h-3 w-28" />
    </div>
  );
}

/** Job / download row: title, tag, meta and link on one hairline row. */
export function SkeletonRow({ className }: BaseProps) {
  return (
    <div aria-hidden className={cn("flex min-h-[88px] items-center gap-6 border-t hairline py-6", className)}>
      <Skeleton className="h-5 w-[38%]" />
      <Skeleton className="hidden h-6 w-28 md:block" />
      <Skeleton className="hidden h-3 w-24 md:block" />
      <Skeleton className="ml-auto h-3 w-20" />
    </div>
  );
}
