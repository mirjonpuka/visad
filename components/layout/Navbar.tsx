"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonPrimary } from "@/components/ui/Button";
import { Link, usePathname } from "@/i18n/navigation";
import { useEscape, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLayoutUI } from "./LayoutUIProvider";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { useSiteData } from "./SiteDataProvider";

type MenuKey = "systems" | "solutions";

const HOVER_INTENT_MS = 120;
const LEAVE_GRACE_MS = 250;
const SOLID_AFTER_PX = 40;
const HIDE_AFTER_PX = 400;

/**
 * Fixed navbar (UI §2.1): transparent over a hero, solid + blur after 40px,
 * hides on scroll down after 400px and returns on scroll up. Hosts the two
 * mega-menus (§2.2) and the mobile menu (§2.3).
 */
export function Navbar() {
  const t = useTranslations();
  const { systems, solutions } = useSiteData();
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, heroUnderNav } = useLayoutUI();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const systemsTriggerRef = useRef<HTMLButtonElement>(null);
  const solutionsTriggerRef = useRef<HTMLButtonElement>(null);
  const systemsPanelRef = useRef<HTMLDivElement>(null);
  const solutionsPanelRef = useRef<HTMLDivElement>(null);
  const intentTimer = useRef<number | undefined>(undefined);
  const graceTimer = useRef<number | undefined>(undefined);
  // True for a moment after a hover-open, so the following click does not close it
  const justHoverOpened = useRef(false);

  // ---- Scroll: solid background + hide on scroll down ----
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    function update() {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SOLID_AFTER_PX);
      if (y <= HIDE_AFTER_PX) setHidden(false);
      else if (y > lastY + 4) setHidden(true);
      else if (y < lastY - 4) setHidden(false);
      lastY = y;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // ---- Mega-menu open/close ----
  const clearTimers = () => {
    window.clearTimeout(intentTimer.current);
    window.clearTimeout(graceTimer.current);
  };
  const closeMenus = useCallback(() => {
    clearTimers();
    setOpenMenu(null);
  }, []);

  const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function onTriggerEnter(key: MenuKey) {
    if (!canHover()) return;
    clearTimers();
    if (openMenu === key) return;
    intentTimer.current = window.setTimeout(
      () => {
        justHoverOpened.current = true;
        window.setTimeout(() => (justHoverOpened.current = false), 500);
        setOpenMenu(key);
      },
      openMenu ? 0 : HOVER_INTENT_MS,
    );
  }
  function onMenuLeave() {
    if (!canHover()) return;
    window.clearTimeout(intentTimer.current);
    graceTimer.current = window.setTimeout(() => setOpenMenu(null), LEAVE_GRACE_MS);
  }
  function onPanelEnter() {
    window.clearTimeout(graceTimer.current);
  }
  function onTriggerClick(key: MenuKey) {
    clearTimers();
    // A click right after a hover-open should not immediately close it
    if (openMenu === key && justHoverOpened.current) return;
    justHoverOpened.current = false;
    setOpenMenu(openMenu === key ? null : key);
  }

  // Esc closes and returns focus to the trigger
  const onEscape = useCallback(() => {
    if (openMenu) {
      (openMenu === "systems" ? systemsTriggerRef : solutionsTriggerRef).current?.focus();
      closeMenus();
    } else if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      burgerRef.current?.focus();
    }
  }, [openMenu, mobileMenuOpen, closeMenus, setMobileMenuOpen]);
  useEscape(!!openMenu || mobileMenuOpen, onEscape);

  // Click outside the navbar closes the mega-menu
  useEffect(() => {
    if (!openMenu) return;
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) closeMenus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openMenu, closeMenus]);

  useFocusTrap(openMenu === "systems", [systemsTriggerRef, systemsPanelRef], true);
  useFocusTrap(openMenu === "solutions", [solutionsTriggerRef, solutionsPanelRef], true);

  // ---- Mobile menu ----
  useScrollLock(mobileMenuOpen);
  useFocusTrap(mobileMenuOpen, [headerRef, mobileRef]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const id = window.setTimeout(
      () => mobileRef.current?.querySelector<HTMLElement>("a, button")?.focus(),
      80,
    );
    return () => window.clearTimeout(id);
  }, [mobileMenuOpen]);

  // Close the mobile menu if the viewport grows past the compact layout
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onResize() {
      if (burgerRef.current && burgerRef.current.offsetParent === null) setMobileMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  // Any navigation (incl. back/forward) closes every menu
  useEffect(() => {
    // Syncing UI with an external change (the URL), not derived state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closeMenus();
    setMobileMenuOpen(false);
  }, [pathname, closeMenus, setMobileMenuOpen]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const navigate = () => {
    closeMenus();
    setMobileMenuOpen(false);
  };

  const transparent = heroUnderNav && !scrolled && !openMenu && !mobileMenuOpen;
  const visible = !hidden || !!openMenu || mobileMenuOpen || focusWithin;

  const link = (href: "/projektet" | "/fabrika" | "/karriera" | "/kontakt", label: string) => (
    <li>
      <Link href={href} className="nav-link" aria-current={isActive(href) ? "page" : undefined}>
        {label}
      </Link>
    </li>
  );
  const trigger = (key: MenuKey, label: string, activePath: string) => (
    <li onMouseEnter={() => onTriggerEnter(key)} onMouseLeave={onMenuLeave}>
      <button
        ref={key === "systems" ? systemsTriggerRef : solutionsTriggerRef}
        type="button"
        className="nav-link"
        aria-expanded={openMenu === key}
        aria-controls={`mega-${key}`}
        aria-current={isActive(activePath) ? "page" : undefined}
        onClick={() => onTriggerClick(key)}
      >
        {label}
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          aria-hidden
          className={cn(
            "transition-transform duration-(--dur-s) ease-out-expo",
            openMenu === key && "rotate-180",
          )}
        />
      </button>
    </li>
  );

  return (
    <>
      <header
        ref={headerRef}
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-(--navbar-h) border-b text-text-on-dark",
          "[transition:background-color_300ms_var(--ease-standard),border-color_300ms_var(--ease-standard),translate_400ms_var(--ease-out-expo)]",
          transparent
            ? "border-transparent bg-transparent"
            : mobileMenuOpen
              ? "border-transparent bg-ink-900"
              : "border-line-dark bg-[rgba(14,15,17,0.88)] backdrop-blur-[12px]",
          !visible && "-translate-y-full",
        )}
      >
        <div className="site-container flex h-full items-center justify-between gap-6">
          {/* Left: logo (+ eyebrow where it fits) */}
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" aria-label={t("nav.home")} className="shrink-0" onClick={navigate}>
              <Image
                src="/brand/logo/visad-logo-on-dark.svg"
                alt=""
                width={140}
                height={55}
                loading="eager"
                className="h-auto w-[140px]"
              />
            </Link>
            <div className="nav-eyebrow items-center gap-6">
              <span aria-hidden className="h-7 w-px bg-line-dark" />
              <span className="font-mono text-label whitespace-nowrap text-text-on-dark-3 uppercase">
                {t("nav.tagline")}
              </span>
            </div>
          </div>

          {/* Centre: main links (laptop) */}
          <nav aria-label={t("nav.main")} className="nav-full">
            <ul className="flex items-center gap-6 laptop:gap-8">
              {trigger("systems", t("nav.systems"), "/sistemet")}
              {link("/projektet", t("nav.projects"))}
              {link("/fabrika", t("nav.factory"))}
              {trigger("solutions", t("nav.solutions"), "/zgjidhje")}
              {link("/karriera", t("nav.careers"))}
              {link("/kontakt", t("nav.contact"))}
            </ul>
          </nav>

          {/* Right: language + quote (+ menu button below 1024) */}
          <div className="flex shrink-0 items-center gap-3 lg:gap-6">
            <LanguageSwitcher className="nav-full" />
            <ButtonPrimary href="/kontakt" onClick={navigate}>
              <span className="max-[399px]:hidden">{t("cta.quote")}</span>
              <span className="min-[400px]:hidden">{t("cta.quoteShort")}</span>
            </ButtonPrimary>
            <button
              ref={burgerRef}
              type="button"
              className="nav-compact icon-btn icon-btn-44 items-center justify-center rounded-full"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="burger" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        <MegaMenu
          ref={systemsPanelRef}
          id="mega-systems"
          open={openMenu === "systems"}
          title={t("nav.systems")}
          intro={t("nav.systemsIntro")}
          items={systems}
          columns={3}
          itemHref={(slug) => ({ pathname: "/sistemet/[slug]", params: { slug } })}
          allLink={{ href: "/sistemet", label: t("cta.allSystems") }}
          onNavigate={navigate}
          onMouseEnter={onPanelEnter}
          onMouseLeave={onMenuLeave}
        />
        <MegaMenu
          ref={solutionsPanelRef}
          id="mega-solutions"
          open={openMenu === "solutions"}
          title={t("nav.solutions")}
          intro={t("nav.solutionsIntro")}
          items={solutions}
          columns={4}
          itemHref={(segment) => ({ pathname: "/zgjidhje/[segment]", params: { segment } })}
          onNavigate={navigate}
          onMouseEnter={onPanelEnter}
          onMouseLeave={onMenuLeave}
        />
      </header>

      {/* Page dim behind an open mega-menu */}
      <div
        aria-hidden
        onClick={closeMenus}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-(--dur-s) ease-standard",
          openMenu ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <MobileMenu ref={mobileRef} open={mobileMenuOpen} onNavigate={navigate} isActive={isActive} />
    </>
  );
}
