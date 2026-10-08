"use client";

import type { ComponentProps } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { sq: "AL", en: "EN", it: "IT", de: "DE" };

type Props = {
  /** "sm" = navbar / footer (Mono 11px); "lg" = mobile menu (44px targets) */
  size?: "sm" | "lg";
  className?: string;
};

/**
 * AL EN IT DE (UI §2.1). Each link points to the same page in the other
 * language (localized pathname). Dynamic slugs are mapped per document once
 * the CMS provides them (Phase 3/7).
 */
export function LanguageSwitcher({ size = "sm", className }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  const routeParams = Object.fromEntries(Object.entries(params).filter(([key]) => key !== "locale"));
  const href = { pathname, params: routeParams } as ComponentProps<typeof Link>["href"];

  return (
    <nav aria-label={t("nav.language")} className={className}>
      <ul className={cn("flex items-center", size === "sm" ? "gap-2.5" : "gap-2")}>
        {routing.locales.map((l) => {
          const active = l === locale;
          return (
            <li key={l}>
              <Link
                href={href}
                locale={l}
                prefetch={false}
                hrefLang={l}
                lang={l}
                // Name contains the visible code (WCAG 2.5.3 label in name)
                aria-label={`${LABELS[l]} · ${t(`languages.${l}`)}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex items-center justify-center font-mono uppercase transition-colors duration-(--dur-s) ease-standard",
                  size === "sm"
                    ? "min-h-6 text-[11px] font-medium tracking-[0.1em]"
                    : "h-11 min-w-11 px-2 text-[13px] font-medium tracking-[0.1em]",
                  active ? "text-text-on-dark" : "text-text-on-dark-3 hover:text-text-on-dark",
                  size === "lg" && active && "shadow-[inset_0_-1px_0_var(--color-red-500)]",
                )}
              >
                {LABELS[l]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
