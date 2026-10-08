"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { whatsappHref } from "@/lib/whatsapp";
import { useSiteData } from "./SiteDataProvider";

/**
 * wa.me link whose prefilled message names the current page (UI §2.5).
 * Number and message come from siteSettings (CMS); the message falls back to
 * the UI string. Server render has the plain number; the page title is added
 * after hydration and on every route change.
 */
export function useWhatsAppHref() {
  const t = useTranslations("whatsapp");
  const { whatsappNumber, whatsappMessage } = useSiteData();
  const pathname = usePathname();
  const [href, setHref] = useState(() => whatsappHref(whatsappNumber));

  useEffect(() => {
    // Wait a frame so the new route's <title> is in place
    const id = requestAnimationFrame(() => {
      const page = document.title.replace(/\s·\sVISAD$/, "") || "visad.al";
      const message = whatsappMessage ? whatsappMessage.replace("{page}", page) : t("message", { page });
      setHref(whatsappHref(whatsappNumber, message));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, t, whatsappNumber, whatsappMessage]);

  return href;
}
