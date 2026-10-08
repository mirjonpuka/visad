"use client";

import type { ComponentProps, CSSProperties, Ref } from "react";
import { useLocale } from "next-intl";
import { CMSImage } from "@/components/media/CMSImage";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Link } from "@/i18n/navigation";
import { t10n, type MenuItem } from "@/lib/site";
import { cn } from "@/lib/utils";

type Href = ComponentProps<typeof Link>["href"];

type Props = {
  id: string;
  open: boolean;
  title: string;
  intro: string;
  items: MenuItem[];
  itemHref: (slug: string) => Href;
  allLink?: { href: Href; label: string };
  columns: 3 | 4;
  onNavigate: () => void;
  ref?: Ref<HTMLDivElement>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

/**
 * Full-width panel under the navbar (UI §2.2): intro column (3/12) + items
 * grid (9/12) with 16:10 thumbnails. Always in the DOM (closed = hidden + inert)
 * so the open/close transition can run.
 */
export function MegaMenu({
  id,
  open,
  title,
  intro,
  items,
  itemHref,
  allLink,
  columns,
  onNavigate,
  ref,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const locale = useLocale();
  return (
    <div
      ref={ref}
      id={id}
      className="mega-panel absolute inset-x-0 top-full border-b border-line-dark bg-ink-800 shadow-mega"
      data-open={open ? "" : undefined}
      inert={!open}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="site-container grid-12 py-10">
        <div className="mega-item col-span-3 flex flex-col gap-3 pr-8" style={{ "--i": 0 } as CSSProperties}>
          <p className="text-h4">{title}</p>
          <p className="text-body-s text-text-on-dark-2">{intro}</p>
          {allLink && (
            <LinkArrow href={allLink.href} className="mt-3 self-start" onClick={onNavigate}>
              {allLink.label}
            </LinkArrow>
          )}
        </div>
        <ul
          className={cn(
            "col-span-9 grid content-start gap-x-5 gap-y-6",
            columns === 3 ? "grid-cols-3" : "grid-cols-4",
          )}
        >
          {items.map((item, index) => {
            const slug = t10n(item.slug, locale);
            // 3×2 grid: thumbnail beside the text keeps the panel ~360px tall (UI §2.2)
            const row = columns === 3;
            return (
              <li
                key={item.slug.sq}
                className="mega-item min-w-0"
                style={{ "--i": index + 1 } as CSSProperties}
              >
                <Link
                  href={itemHref(slug)}
                  className={cn("mega-link group", row ? "flex items-center gap-4" : "block")}
                  onClick={onNavigate}
                >
                  <div
                    className={cn(
                      "mega-thumb shrink-0 overflow-hidden rounded-base",
                      row && "w-[42%] max-w-[168px]",
                    )}
                  >
                    <CMSImage
                      image={item.image}
                      ratio="16/10"
                      decorative
                      placeholderNote={row ? undefined : item.placeholderNote}
                      sizes={row ? "168px" : "(min-width: 1440px) 250px, 18vw"}
                    />
                  </div>
                  <div className={cn("min-w-0", !row && "mt-4")}>
                    <p className="text-h4">
                      <span className="mega-name pb-0.5">{t10n(item.title, locale)}</span>
                    </p>
                    <p className="mt-1.5 line-clamp-1 text-body-s text-text-on-dark-2">
                      {t10n(item.text, locale)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
