"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { onHeroIn } from "@/components/motion/heroSignal";
import { cn } from "@/lib/utils";
import { useLayoutUI } from "./LayoutUIProvider";
import { useWhatsAppHref } from "./useWhatsAppHref";

/** Back ~600ms after the last scroll event (owner brief B2) */
const IDLE_MS = 600;

/**
 * Floating WhatsApp button (UI §2.5). 56px circle bottom-right; on laptop it
 * expands into a pill with a label on hover (clip-path, no width animation).
 * Owner brief B2: fades out (200ms) while the page scrolls and back in
 * (300ms) ~600ms after scrolling stops; stays hidden while the footer's
 * bottom bar is on screen so it never covers the language switcher; not
 * clickable while hidden. Also hidden while the mobile menu is open.
 */
export function WhatsAppFab() {
  const t = useTranslations("cta");
  const href = useWhatsAppHref();
  const { mobileMenuOpen, cookieBannerHeight } = useLayoutUI();
  // Appears once the intro has finished (or right away on later visits)
  const [shown, setShown] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [footerBar, setFooterBar] = useState(false);
  useEffect(() => onHeroIn(() => setShown(true)), []);

  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      setScrolling(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setScrolling(false), IDLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  // The footer is rendered on every page; observe its bottom bar
  useEffect(() => {
    const bar = document.querySelector("[data-footer-bottom]");
    if (!bar) return;
    const observer = new IntersectionObserver(([entry]) => setFooterBar(entry.isIntersecting));
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  const visible = shown && !mobileMenuOpen && !scrolling && !footerBar;

  return (
    <div
      className={cn(
        // The wrapper is as wide as the expanded pill: it must never catch clicks
        "pointer-events-none fixed right-4 z-40 origin-bottom-right drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:right-6",
        "[transition-property:opacity,scale,bottom] ease-out-expo",
        visible ? "opacity-100 duration-300" : "opacity-0 duration-200",
        shown ? "scale-100" : "scale-60",
      )}
      style={{ bottom: `calc(${cookieBannerHeight ? cookieBannerHeight + 16 : 0}px + var(--fab-gap))` }}
      data-fab-visible={visible ? "" : undefined}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsappFab")}
        tabIndex={visible ? undefined : -1}
        aria-hidden={visible ? undefined : true}
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
