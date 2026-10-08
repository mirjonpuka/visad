import { icons, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveals";
import { cn } from "@/lib/utils";
import type { Benefit } from "@/sanity/lib/types";

/** "thermometer" / "volume-x" → lucide component (server only, so no client cost). */
function lucide(name?: string | null): LucideIcon | null {
  if (!name) return null;
  const pascal = name
    .trim()
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (icons as Record<string, LucideIcon>)[pascal] ?? null;
}

/** Icon + title + text blocks (system benefits, solution offer, careers). */
export function BenefitsGrid({
  items,
  columns = 4,
  className,
}: {
  items: Benefit[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const list = items.filter((b) => b.title);
  if (!list.length) return null;
  return (
    <Reveal
      as="ul"
      stagger
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2",
        columns === 3 && "laptop:grid-cols-3",
        columns === 4 && "laptop:grid-cols-4",
        className,
      )}
    >
      {list.map((benefit, i) => {
        const Icon = lucide(benefit.icon);
        return (
          <li key={i} className="flex flex-col gap-3 border-t hairline pt-6">
            {Icon ? (
              <Icon size={24} strokeWidth={1.5} aria-hidden className="text-red-500" />
            ) : (
              <span className="font-mono text-label text-(--surface-fg-3) tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <h3 className="text-h4">{benefit.title}</h3>
            {benefit.text && <p className="text-body-s text-(--surface-fg-2)">{benefit.text}</p>}
          </li>
        );
      })}
    </Reveal>
  );
}
