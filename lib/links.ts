import type { AppHref } from "@/components/ui/Button";
import { routing } from "@/i18n/routing";

const internal = new Set(Object.keys(routing.pathnames));

/**
 * CMS buttons store plain paths ("/kontakt", "/projektet#filter", "https://…").
 * Known internal paths become typed, localized routes; anything else is external.
 */
export function cmsHref(
  href: string | null | undefined,
): { href: AppHref } | { externalHref: string } | null {
  if (!href) return null;
  const [path, hash] = href.split("#");
  if (internal.has(path)) {
    return { href: (hash ? { pathname: path, hash } : path) as AppHref };
  }
  return { externalHref: href };
}
