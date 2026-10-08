import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: Parameters<typeof getPathname>[0]["href"] };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";

/**
 * "Kryefaqja / Sistemet / Dritare" in Mono 11px under inner page titles
 * (UI §2.10), plus the same trail as JSON-LD BreadcrumbList. The home crumb
 * is added automatically; the last crumb is the current page.
 */
export async function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const t = await getTranslations("breadcrumb");
  const locale = (await getLocale()) as Locale;
  const trail: Crumb[] = [{ label: t("home"), href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: SITE_URL + getPathname({ href: crumb.href, locale }) } : {}),
    })),
  };

  return (
    <nav
      aria-label={t("label")}
      className={cn("font-mono text-label text-(--surface-fg-3) uppercase", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <Fragment key={index}>
              <li>
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="transition-colors hover:text-(--surface-fg)">
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={last ? "page" : undefined}
                    className={cn(last && "text-(--surface-fg-2)")}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden className="opacity-60">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        // JSON-LD must be inline; content is built from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </nav>
  );
}
