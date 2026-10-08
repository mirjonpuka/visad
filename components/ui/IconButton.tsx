import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Required: icon-only buttons need an accessible name */
  label: string;
  size?: 40 | 44;
  children: ReactNode;
  "data-force"?: string;
};

/** 40/44px circle with a 1px border and a centred icon (UI §2.6). */
export function IconButton({ label, size = 44, className, children, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn("icon-btn", size === 40 ? "icon-btn-40" : "icon-btn-44", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
