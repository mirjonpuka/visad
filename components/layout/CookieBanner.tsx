"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import { COOKIE_BANNER_ENABLED } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { useLayoutUI } from "./LayoutUIProvider";

export const CONSENT_COOKIE = "visad-consent";
export type Consent = "all" | "essential";

export function readConsent(): Consent | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|essential)`));
  return (match?.[1] as Consent) ?? null;
}

function writeConsent(value: Consent) {
  // Remember the choice for 12 months (UI §2.9)
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("visad:consent", { detail: value }));
}

/**
 * Cookie banner (UI §2.9). Built but OFF at launch (COOKIE_BANNER_ENABLED,
 * DECISIONS D1.37) because the site sets no non-essential cookies yet.
 * `preview` renders it inline (dev kit) without touching the cookie.
 */
export function CookieBanner({ preview = false }: { preview?: boolean }) {
  const t = useTranslations("cookie");
  const { setCookieBannerHeight } = useLayoutUI();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (preview || !COOKIE_BANNER_ENABLED) return;
    // Read the cookie after mount (not available during prerender)
    const id = requestAnimationFrame(() => setOpen(readConsent() === null));
    return () => cancelAnimationFrame(id);
  }, [preview]);

  // Report the height so the WhatsApp FAB can move above the banner
  useEffect(() => {
    if (preview || !open || !ref.current) return;
    const el = ref.current;
    const observer = new ResizeObserver(() => setCookieBannerHeight(el.offsetHeight));
    observer.observe(el);
    return () => {
      observer.disconnect();
      setCookieBannerHeight(0);
    };
  }, [open, preview, setCookieBannerHeight]);

  if (!preview && !open) return null;

  function choose(value: Consent) {
    if (!preview) writeConsent(value);
    setOpen(false);
  }

  return (
    <div
      ref={ref}
      role="region"
      aria-label={t("label")}
      className={cn(
        "surface-dark rounded-base bg-ink-800 p-5 text-text-on-dark",
        preview
          ? "max-w-[420px]"
          : "fixed inset-x-4 bottom-4 z-50 md:right-auto md:bottom-6 md:left-6 md:max-w-[420px]",
      )}
    >
      <p className="text-body-s text-text-on-dark-2">{t("text")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonPrimary onClick={() => choose("all")}>{t("accept")}</ButtonPrimary>
        <ButtonSecondary onClick={() => choose("essential")}>{t("essential")}</ButtonSecondary>
      </div>
    </div>
  );
}
