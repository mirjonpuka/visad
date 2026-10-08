"use client";

import { AnimatePresence, LazyMotion, MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { ProjectTile } from "@/components/ui/ProjectTile";
import type { SiteImage } from "@/lib/images";
import { useEscape, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export type BrowserProject = {
  id: string;
  title: string;
  slug: string;
  city: string | null;
  year: number | null;
  type: string | null;
  systems: { key: string; title: string }[];
  image: SiteImage | null;
};

type Filters = { lloji: string[]; sistemi: string[]; qyteti: string[] };
const EMPTY: Filters = { lloji: [], sistemi: [], qyteti: [] };
const KEYS = ["lloji", "sistemi", "qyteti"] as const;
const PAGE = 15;

/* Pattern of 5 (UI §6.3 = Home §3.4), repeated by auto-placement */
const PATTERN = [
  "md:col-span-2 laptop:col-span-7 laptop:row-span-2",
  "laptop:col-span-5",
  "laptop:col-span-5",
  "laptop:col-span-5 laptop:row-span-2",
  "laptop:col-span-7 laptop:row-span-2",
];
const PATTERN_SIZES = [
  "(min-width: 1200px) 58vw, 100vw",
  "(min-width: 1200px) 41vw, (min-width: 768px) 50vw, 100vw",
  "(min-width: 1200px) 41vw, (min-width: 768px) 50vw, 100vw",
  "(min-width: 1200px) 41vw, (min-width: 768px) 50vw, 100vw",
  "(min-width: 1200px) 58vw, (min-width: 768px) 50vw, 100vw",
];
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
// Layout/FLIP features arrive after hydration (keeps them out of the first load)
const loadFeatures = () => import("./motionFeatures").then((mod) => mod.default);

function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search);
  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  return { lloji: list("lloji"), sistemi: list("sistemi"), qyteti: list("qyteti") };
}

function writeFilters(filters: Filters) {
  const params = new URLSearchParams(window.location.search);
  for (const key of KEYS) {
    if (filters[key].length) params.set(key, filters[key].join(","));
    else params.delete(key);
  }
  const query = params.toString();
  const url = window.location.pathname + (query ? `?${query}` : "") + window.location.hash;
  // pushState: every filter change is a history entry, so Back undoes it (UI §6.2)
  window.history.pushState(window.history.state, "", url);
}

type Labels = {
  type: string;
  system: string;
  city: string;
  allCities: string;
  clear: string;
  filter: string;
  show: string; // contains {n}
  loadMore: string;
  empty: string;
  close: string;
  filtersLabel: string;
  viewProject: string;
  types: Record<string, string>;
};

/**
 * Projects grid with filters (UI §6, Motion §4.7). The full list (≤ 200) is
 * in the server HTML; filters run on the client, are kept in the URL query
 * (?lloji=hotel&sistemi=dritare) and animate with Motion layout (FLIP).
 * Phone: the filter bar becomes a "Filtro (n)" button with a bottom sheet.
 */
export function ProjectsBrowser({
  projects,
  systems,
  labels,
}: {
  projects: BrowserProject[];
  systems: { key: string; title: string }[];
  labels: Labels;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [limit, setLimit] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);

  // URL → state after mount and on Back/Forward
  useEffect(() => {
    const sync = () => setFilters(readFilters());
    const id = requestAnimationFrame(sync);
    window.addEventListener("popstate", sync);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const update = useCallback((next: Filters) => {
    setFilters(next);
    setLimit(PAGE);
    writeFilters(next);
  }, []);

  const toggle = (key: keyof Filters, value: string) => {
    const has = filters[key].includes(value);
    update({ ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] });
  };

  const types = useMemo(
    () => Object.keys(labels.types).filter((type) => projects.some((p) => p.type === type)),
    [labels.types, projects],
  );
  const usedSystems = useMemo(
    () => systems.filter((s) => projects.some((p) => p.systems.some((ps) => ps.key === s.key))),
    [systems, projects],
  );
  const cities = useMemo(
    () => [...new Set(projects.map((p) => p.city).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  // OR within a group, AND between groups (UI §6.2)
  const results = useMemo(
    () =>
      projects.filter(
        (p) =>
          (!filters.lloji.length || (p.type && filters.lloji.includes(p.type))) &&
          (!filters.sistemi.length || p.systems.some((s) => filters.sistemi.includes(s.key))) &&
          (!filters.qyteti.length || (p.city && filters.qyteti.includes(p.city))),
      ),
    [projects, filters],
  );
  const activeCount = filters.lloji.length + filters.sistemi.length + filters.qyteti.length;
  const shown = results.slice(0, limit);
  const editorial = results.length >= 5;

  const groups = (
    <>
      <FilterGroup label={labels.type}>
        {types.map((type) => (
          <Chip key={type} active={filters.lloji.includes(type)} onClick={() => toggle("lloji", type)}>
            {labels.types[type]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label={labels.system}>
        {usedSystems.map((s) => (
          <Chip key={s.key} active={filters.sistemi.includes(s.key)} onClick={() => toggle("sistemi", s.key)}>
            {s.title}
          </Chip>
        ))}
      </FilterGroup>
      {cities.length > 1 && (
        <FilterGroup label={labels.city}>
          <select
            value={filters.qyteti[0] ?? ""}
            onChange={(e) => update({ ...filters, qyteti: e.target.value ? [e.target.value] : [] })}
            aria-label={labels.city}
            className="h-11 rounded-base border hairline bg-transparent px-3 text-body-s"
          >
            <option value="">{labels.allCities}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FilterGroup>
      )}
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {/* Filter bar: sticky under the navbar (laptop/tablet) */}
        <div className="sticky-under-nav surface-light border-b hairline bg-alu-50">
          <div className="site-container">
            <div
              role="group"
              aria-label={labels.filtersLabel}
              className="hidden flex-wrap items-center gap-x-10 gap-y-3 py-4 md:flex"
            >
              {groups}
              {activeCount > 0 && (
                <button type="button" onClick={() => update(EMPTY)} className="link-arrow ml-auto text-body-s font-medium">
                  <span>{labels.clear}</span>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between py-3 md:hidden">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
                className="chip"
              >
                <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden />
                {labels.filter}
                {activeCount > 0 && <span className="font-mono text-label tabular">({activeCount})</span>}
              </button>
              {activeCount > 0 && (
                <button type="button" onClick={() => update(EMPTY)} className="text-body-s font-medium underline underline-offset-4">
                  {labels.clear}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="surface-light section-y">
          <div className="site-container">
            <p aria-live="polite" className="sr-only">
              {labels.show.replace("{n}", String(results.length))}
            </p>
            {results.length === 0 ? (
              <div className="flex flex-col items-start gap-6 py-24">
                <p className="text-h3">{labels.empty}</p>
                <button type="button" onClick={() => update(EMPTY)} className="link-arrow text-body-s font-medium">
                  <span>{labels.clear}</span>
                  <span className="link-arrow__arrow" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            ) : (
              <m.ul
                layout
                className={cn(
                  "grid grid-cols-1 gap-5 md:grid-cols-2",
                  editorial && "laptop:auto-rows-[290px] laptop:grid-cols-12",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((project, i) => (
                    <m.li
                      key={project.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, delay: Math.min(i, 10) * 0.03 } }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                      transition={{ layout: { duration: 0.45, ease: EASE_OUT_EXPO } }}
                      className={cn(
                        "h-80 md:h-[360px]",
                        editorial ? cn("laptop:h-auto", PATTERN[i % 5]) : "laptop:h-[420px]",
                      )}
                    >
                      <ProjectTile
                        title={project.title}
                        slug={project.slug}
                        meta={[project.city, project.systems[0]?.title, project.year].filter(Boolean).join(" · ")}
                        image={project.image}
                        number={String(i + 1).padStart(2, "0")}
                        viewLabel={labels.viewProject}
                        sizes={editorial ? PATTERN_SIZES[i % 5] : "(min-width: 768px) 50vw, 100vw"}
                        priority={i < 2}
                        className="h-full"
                      />
                    </m.li>
                  ))}
                </AnimatePresence>
              </m.ul>
            )}

            {results.length > limit && (
              <div className="mt-14 flex justify-center">
                <ButtonSecondary size="lg" onClick={() => setLimit((n) => n + PAGE)}>
                  {labels.loadMore}
                </ButtonSecondary>
              </div>
            )}
          </div>
        </div>

        <FilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={labels.filter}
          closeLabel={labels.close}
          footer={
            <ButtonPrimary className="w-full" onClick={() => setSheetOpen(false)}>
              {labels.show.replace("{n}", String(results.length))}
            </ButtonPrimary>
          }
        >
          {groups}
        </FilterSheet>
      </LazyMotion>
    </MotionConfig>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <span className="font-mono text-label text-text-on-light-3 uppercase">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Phone bottom sheet (UI §6.2): dialog, focus trapped, Esc / backdrop closes. */
function FilterSheet({
  open,
  onClose,
  title,
  closeLabel,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, [ref]);
  useScrollLock(open);
  useEscape(open, onClose);
  useEffect(() => {
    if (open) ref.current?.querySelector<HTMLElement>("button")?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <m.div
            className="absolute inset-0 bg-[rgba(14,15,17,0.6)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="surface-light absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-[12px] bg-alu-50"
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: { duration: 0.45, ease: EASE_OUT_EXPO } }}
            exit={{ y: "100%", transition: { duration: 0.3 } }}
          >
            <div className="flex items-center justify-between border-b hairline px-5 py-4">
              <h2 className="text-h4">{title}</h2>
              <button type="button" onClick={onClose} aria-label={closeLabel} className="icon-btn icon-btn-40">
                <X size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <div className="flex flex-col gap-8 overflow-y-auto px-5 py-6">{children}</div>
            <div className="border-t hairline px-5 py-4">{footer}</div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
