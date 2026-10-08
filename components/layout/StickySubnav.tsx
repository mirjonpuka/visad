"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/motion/LenisProvider";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string };

/**
 * Sticky in-page navigation (UI §5.2): 52px ink-800 bar under the navbar,
 * the section in view gets a red underline. Smooth-scrolls with Lenis.
 */
export function StickySubnav({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const lenis = useLenis();

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={label} className="sticky-under-nav surface-dark border-b border-line-dark bg-ink-800">
      <ul className="site-container flex h-[52px] items-stretch gap-8 overflow-x-auto [scrollbar-width:none]">
        {items.map((item) => (
          <li key={item.id} className="flex shrink-0">
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              onClick={(event) => {
                const target = document.getElementById(item.id);
                if (!target || !lenis) return;
                event.preventDefault();
                lenis.scrollTo(target, { offset: -128 });
                history.replaceState(null, "", `#${item.id}`);
              }}
              className={cn(
                "flex items-center font-mono text-label uppercase transition-colors",
                active === item.id
                  ? "text-text-on-dark shadow-[inset_0_-2px_0_var(--color-red-500)]"
                  : "text-text-on-dark-3 hover:text-text-on-dark",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
