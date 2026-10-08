"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

type Props = {
  items: TabItem[];
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  className?: string;
};

/** Accessible tabs (role="tablist"); ArrowLeft/Right/Home/End select (UI §11.2). */
export function Tabs({ items, label, defaultValue, value, onValueChange, className }: Props) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const current = value ?? internal;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(id: string) {
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
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
    tabs.current[target]?.focus();
    select(items[target].id);
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-8 border-b hairline">
        {items.map((item, index) => {
          const selected = item.id === current;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              id={`${baseId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "relative -mb-px min-h-11 pb-3.5 text-[15px] font-medium transition-colors duration-(--dur-s) ease-standard",
                selected ? "text-(--surface-fg)" : "text-(--surface-fg-2) hover:text-(--surface-fg)",
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-red-500 transition-transform duration-(--dur-m) ease-out-expo",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${baseId}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== current}
          tabIndex={0}
          className="pt-10 focus-visible:outline-offset-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
