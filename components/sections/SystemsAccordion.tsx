"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CMSImage } from "@/components/media/CMSImage";
import { Accordion } from "@/components/ui/Accordion";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

export type AccordionSystem = {
  id: string;
  title: string;
  slug: string;
  text: string;
  image: SiteImage | null;
  hasDatasheet: boolean;
};

/**
 * Vitrocsa-style systems accordion (UI §3.3B). From tablet up the open row's
 * image shows on the right with a "01 / 06 · Dyer" label; on phone the image
 * sits inside the open row. Basic crossfade now; full motion in Phase 5.
 */
export function SystemsAccordion({ systems }: { systems: AccordionSystem[] }) {
  const t = useTranslations();
  const [open, setOpen] = useState<number | null>(0);
  const [shown, setShown] = useState(0); // last opened row keeps its image
  // Photos load only for rows that were opened (A2: all 6 used to download at once)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const total = String(systems.length).padStart(2, "0");

  function onOpenChange(index: number | null) {
    setOpen(index);
    if (index !== null) {
      setShown(index);
      setVisited((v) => (v.has(index) ? v : new Set(v).add(index)));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-16 md:grid-cols-[46fr_54fr] md:gap-10 laptop:gap-16">
      <Accordion
        size="md"
        open={open}
        onOpenChange={onOpenChange}
        items={systems.map((system, i) => ({
          id: system.id,
          number: String(i + 1).padStart(2, "0"),
          title: system.title,
          content: (
            <div className="flex max-w-[460px] flex-col gap-4">
              {/* Phone: the image lives inside the open row */}
              {visited.has(i) && (
                <div className="md:hidden">
                  <CMSImage image={system.image} ratio="16/10" sizes="90vw" />
                </div>
              )}
              <p className="text-body text-text-on-dark-2">{system.text}</p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <LinkArrow href={{ pathname: "/sistemet/[slug]", params: { slug: system.slug } }} mono>
                  {t("cta.details")}
                </LinkArrow>
                {system.hasDatasheet && (
                  <LinkArrow
                    href={{
                      pathname: "/sistemet/[slug]",
                      params: { slug: system.slug },
                      hash: "detaje-teknike",
                    }}
                    mono
                  >
                    {t("cta.datasheet")}
                  </LinkArrow>
                )}
              </div>
            </div>
          ),
        }))}
      />

      {/* Tablet & laptop: one large image for the open system */}
      {/* Compact (owner): the whole section fits about one screen at 1440×900 */}
      <div className="relative hidden min-h-[420px] overflow-hidden rounded-base md:block laptop:min-h-[460px]">
        {systems.map((system, i) => (
          <div
            key={system.id}
            aria-hidden={i !== shown}
            className={cn(
              "absolute inset-0 transition-[opacity,scale] duration-500 ease-out-expo",
              i === shown ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
            )}
          >
            {visited.has(i) && (
              <CMSImage
                image={system.image}
                fill
                sizes="(min-width: 1440px) 700px, 50vw"
                decorative={i !== shown}
              />
            )}
          </div>
        ))}
        <p className="absolute top-5 left-5 rounded-base bg-[rgba(14,15,17,0.6)] px-3 py-2 font-mono text-label text-text-on-dark uppercase backdrop-blur-sm">
          {t("home.systemOf", { n: String(shown + 1).padStart(2, "0"), total })} · {systems[shown]?.title}
        </p>
      </div>
    </div>
  );
}
