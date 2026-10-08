"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { onHeroIn } from "@/components/motion/heroSignal";
import { cn } from "@/lib/utils";
import { useLayoutUI } from "./LayoutUIProvider";
import { useWhatsAppHref } from "./useWhatsAppHref";

/**
 * Floating WhatsApp button (UI §2.5). 56px circle bottom-right; on laptop it
 * expands into a pill with a label on hover (clip-path, no width animation).
 * Hidden while the mobile menu is open; moves up above the cookie banner.
 */
export function WhatsAppFab() {
  const t = useTranslations("cta");
  const href = useWhatsAppHref();
  const { mobileMenuOpen, cookieBannerHeight } = useLayoutUI();
  // Appears once the intro has finished (or right away on later visits)
  const [shown, setShown] = useState(false);
  useEffect(() => onHeroIn(() => setShown(true)), []);

  const visible = shown && !mobileMenuOpen;

  return (
    <div
      className={cn(
        // The wrapper is as wide as the expanded pill: it must never catch clicks
        "pointer-events-none fixed right-4 z-40 origin-bottom-right drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:right-6",
        "[transition:opacity_400ms_var(--ease-out-expo),scale_400ms_var(--ease-out-expo),bottom_400ms_var(--ease-out-expo)]",
        visible ? "scale-100 opacity-100" : "scale-60 opacity-0",
      )}
      style={{ bottom: `calc(${cookieBannerHeight ? cookieBannerHeight + 16 : 0}px + var(--fab-gap))` }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsappFab")}
        tabIndex={visible ? undefined : -1}
        data-magnetic=""
        className={cn(
          "group flex h-14 items-center rounded-full bg-whatsapp text-whatsapp-ink",
          visible ? "pointer-events-auto" : "pointer-events-none",
          "[clip-path:inset(0_0_0_calc(100%-56px)_round_28px)] [transition:clip-path_350ms_var(--ease-out-expo)]",
          "focus-visible:[clip-path:inset(0_round_28px)] pointer-fine:hover:[clip-path:inset(0_round_28px)]",
        )}
      >
        <span aria-hidden className="pr-1 pl-6 text-[15px] font-semibold whitespace-nowrap">
          {t("whatsappFab")}
        </span>
        <span className="grid h-14 w-14 shrink-0 place-items-center">
          <MessageCircle size={26} strokeWidth={1.5} aria-hidden />
        </span>
      </a>
    </div>
  );
}
