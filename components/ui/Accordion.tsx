"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DrawLine } from "@/components/motion/reveals";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  /** Mono number, e.g. "01" */
  number?: string;
  title: ReactNode;
  content: ReactNode;
};

type Props = {
  items: AccordionItem[];
  /** "lg" = tall h3 rows; "md" = compact h3 rows (Home systems); "sm" = FAQ (h4 rows) */
  size?: "lg" | "md" | "sm";
  /** Index open on first render; null = all closed. Default: first row */
  defaultOpen?: number | null;
  /** Controlled open index */
  open?: number | null;
  onOpenChange?: (index: number | null) => void;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
};

/**
 * Vitrocsa-style accordion (UI §3.3B, Motion §4.5). One row open at a time,
 * rows are real buttons with aria-expanded, ArrowUp/Down/Home/End move focus.
 */
export function Accordion({
  items,
  size = "lg",
  defaultOpen = 0,
  open,
  onOpenChange,
  headingLevel: Heading = "h3",
  className,
}: Props) {
  const baseId = useId();
  const [internal, setInternal] = useState<number | null>(defaultOpen);
  const current = open !== undefined ? open : internal;
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  function toggle(index: number) {
    const next = current === index ? null : index;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const target =
      event.key === "ArrowDown"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowUp"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  }

  const lg = size !== "sm";
  const rowPadding = size === "lg" ? "py-[26px]" : size === "md" ? "py-[18px]" : "py-5";

  return (
    <div className={cn("border-b hairline", className)}>
      {items.map((item, index) => {
        const isOpen = current === index;
        const triggerId = `${baseId}-t-${item.id}`;
        const panelId = `${baseId}-p-${item.id}`;
        return (
          <div key={item.id} className="relative">
            {/* Row hairline draws left → right when it enters (Motion §4.8) */}
            <DrawLine className="absolute inset-x-0 top-0 h-px bg-(--surface-line)" delay={index * 0.05} />
            <Heading className="m-0">
              <button
                ref={(el) => {
                  triggers.current[index] = el;
                }}
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={cn("group flex w-full items-center gap-4 text-left", rowPadding)}
              >
                {item.number && (
                  <span className="w-9 shrink-0 font-mono text-[12px] tracking-[0.1em] text-(--surface-fg-3) tabular">
                    {item.number}
                  </span>
                )}
                <span className={cn("min-w-0 flex-1", lg ? "text-h3" : "text-h4")}>{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "acc-icon icon-btn shrink-0",
                    lg ? "icon-btn-40" : "h-8 w-8",
                    isOpen && "bg-(--btn2-fill) text-(--btn2-fg-hover)",
                  )}
                />
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="acc-panel"
              data-open={isOpen ? "" : undefined}
              inert={!isOpen}
            >
              <div className="acc-panel__inner">
                <div className={cn("acc-panel__content", item.number && "pl-[52px]", size === "lg" ? "pb-8" : "pb-6")}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
