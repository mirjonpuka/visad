import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Toggle state; rendered as aria-pressed */
  active?: boolean;
  /** Optional count shown in Mono after the label */
  count?: number;
  children: ReactNode;
  "data-force"?: string;
};

/**
 * Filter / multi-select chip (UI §6.2, §11). 36px tall with a 44px touch
 * area; active = ink background + white text (inverted on dark surfaces).
 */
export function Chip({ active = false, count, className, children, type = "button", ...rest }: Props) {
  return (
    <button type={type} aria-pressed={active} className={cn("chip", className)} {...rest}>
      {children}
      {count !== undefined && <span className="font-mono text-label tabular opacity-70">{count}</span>}
    </button>
  );
}
