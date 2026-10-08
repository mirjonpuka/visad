import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** e.g. "01 — Sistemet" */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Intro paragraph or a LinkArrow, aligned bottom-right on laptop */
  aside?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

/** Eyebrow + h2 on the left, optional aside bottom-right; 56px bottom margin (UI §2.7). */
export function SectionHeader({ eyebrow, title, aside, as: Heading = "h2", className }: Props) {
  return (
    <header
      className={cn(
        "mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        className,
      )}
    >
      <div className="max-w-[900px] min-w-0 lg:flex-[1_1_auto]">
        {eyebrow && <p className="mb-5 font-mono text-eyebrow text-(--surface-fg-3) uppercase">{eyebrow}</p>}
        <Heading className={cn(Heading === "h1" ? "text-h1" : "text-h2", "text-balance")}>{title}</Heading>
      </div>
      {aside && (
        <div className="flex min-w-0 text-body text-(--surface-fg-2) lg:flex-[0_1_420px] lg:justify-end">
          {aside}
        </div>
      )}
    </header>
  );
}
