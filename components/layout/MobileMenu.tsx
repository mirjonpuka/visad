"use client";

import { useState, type ComponentProps, type CSSProperties, type Ref } from "react";
import { useTranslations } from "next-intl";
import { ButtonWhatsApp } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useSiteData } from "./SiteDataProvider";
import { useWhatsAppHref } from "./useWhatsAppHref";

type Href = ComponentProps<typeof Link>["href"];

type Props = {
  open: boolean;
  onNavigate: () => void;
  isActive: (href: string) => boolean;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Full-screen menu under 1024px (UI §2.3): big numbered links with hairlines,
 * Sistemet / Zgjidhje expand in place; language, phones and WhatsApp at the bottom.
 */
export function MobileMenu({ open, onNavigate, isActive, ref }: Props) {
  const t = useTranslations();
  const { systems, solutions, phones } = useSiteData();
  const wa = useWhatsAppHref();
  const [expanded, setExpanded] = useState<"systems" | "solutions" | null>(null);

  type Row =
    | { key: string; label: string; href: Href; path: string }
    | {
        key: "systems" | "solutions";
        label: string;
        children: { label: string; href: Href }[];
        all?: { label: string; href: Href };
      };

  const rows: Row[] = [
    {
      key: "systems",
      label: t("nav.systems"),
      children: systems.map((s) => ({
        label: s.title,
        href: { pathname: "/sistemet/[slug]", params: { slug: s.slug } },
      })),
      all: { label: t("cta.allSystems"), href: "/sistemet" },
    },
    { key: "projects", label: t("nav.projects"), href: "/projektet", path: "/projektet" },
    { key: "factory", label: t("nav.factory"), href: "/fabrika", path: "/fabrika" },
    {
      key: "solutions",
      label: t("nav.solutions"),
      children: solutions.map((s) => ({
        label: s.title,
        href: { pathname: "/zgjidhje/[segment]", params: { segment: s.slug } },
      })),
    },
    { key: "careers", label: t("nav.careers"), href: "/karriera", path: "/karriera" },
    { key: "contact", label: t("nav.contact"), href: "/kontakt", path: "/kontakt" },
  ];

  return (
    <div
      ref={ref}
      id="mobile-menu"
      className="mobile-menu nav-compact fixed inset-0 z-40 flex-col overflow-y-auto overscroll-contain bg-ink-900"
      data-open={open ? "" : undefined}
      inert={!open}
    >
      <div className="site-container flex min-h-full flex-col pt-[calc(var(--navbar-h)+8px)]">
        <nav aria-label={t("nav.main")}>
          <ul className="border-b border-line-dark">
            {rows.map((row, index) => {
              const number = String(index + 1).padStart(2, "0");
              const style = { "--i": index } as CSSProperties;
              // Rows scale with the screen height so the whole menu, WhatsApp included, fits without scrolling
              const rowClass =
                "flex w-full items-center gap-4 py-[clamp(8px,1.6svh,16px)] text-left text-[clamp(22px,4.2svh,32px)] leading-[1.1] tracking-[-0.02em]";
              const numberEl = (
                <span className="w-8 shrink-0 font-mono text-[12px] tracking-[0.1em] text-text-on-dark-3">
                  {number}
                </span>
              );

              if ("children" in row) {
                const isOpen = expanded === row.key;
                const panelId = `mm-${row.key}`;
                return (
                  <li key={row.key} className="border-t border-line-dark">
                    <div className="overflow-hidden">
                      <button
                        type="button"
                        className={cn("mm-rise", rowClass)}
                        style={style}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setExpanded(isOpen ? null : row.key)}
                      >
                        {numberEl}
                        <span className="flex-1">{row.label}</span>
                        <span aria-hidden className="acc-icon icon-btn icon-btn-40 shrink-0" />
                      </button>
                    </div>
                    <div
                      id={panelId}
                      className="acc-panel"
                      data-open={isOpen ? "" : undefined}
                      inert={!isOpen}
                    >
                      <div className="acc-panel__inner">
                        <ul className="acc-panel__content flex flex-col pb-5 pl-12">
                          {row.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                onClick={onNavigate}
                                className="flex min-h-11 items-center text-body-l text-text-on-dark-2 hover:text-text-on-dark"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                          {row.all && (
                            <li>
                              <Link
                                href={row.all.href}
                                onClick={onNavigate}
                                className="flex min-h-11 items-center gap-2 font-mono text-label text-text-on-dark uppercase"
                              >
                                {row.all.label} <span aria-hidden>→</span>
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              }

              const active = isActive(row.path);
              return (
                <li key={row.key} className="overflow-hidden border-t border-line-dark">
                  <Link
                    href={row.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn("mm-rise", rowClass, active && "text-text-on-dark")}
                    style={style}
                  >
                    {numberEl}
                    <span
                      className={cn(active && "underline decoration-red-500 decoration-1 underline-offset-8")}
                    >
                      {row.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pinned to the bottom: reachable without scrolling, even with a submenu open */}
        <div className="sticky bottom-0 mt-auto flex flex-col gap-3 bg-ink-900 pt-5 pb-[max(16px,env(safe-area-inset-bottom))]">
          <LanguageSwitcher size="lg" />
          <ul className="flex flex-wrap gap-x-6">
            {phones.map((p) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  className="inline-flex min-h-11 items-center font-mono text-[15px] tracking-[0.04em] tabular"
                >
                  {p.display}
                </a>
              </li>
            ))}
          </ul>
          <ButtonWhatsApp externalHref={wa} newTab className="w-full">
            {t("cta.whatsapp")}
          </ButtonWhatsApp>
        </div>
      </div>
    </div>
  );
}
