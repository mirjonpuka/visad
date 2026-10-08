import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** What photo belongs here, e.g. "PHOTO: wide shot of the Visad factory floor" */
  note?: string;
  /** CSS aspect-ratio, e.g. "16/10". Omit to fill the parent (parent must be positioned/sized) */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Flat ink-700 / alu-200 block with a tiny note centred at the bottom
 * (Brand §5, UI §13.3). Used for every image slot that has no photo yet.
 */
export function PlaceholderImage({ note, ratio, className, style }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative w-full overflow-hidden rounded-base bg-(--sk-base)",
        !ratio && "h-full",
        className,
      )}
      style={{ aspectRatio: ratio, ...style }}
    >
      {note && <span className="ph-note">{note}</span>}
    </div>
  );
}
