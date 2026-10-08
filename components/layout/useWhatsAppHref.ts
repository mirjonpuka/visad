"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { whatsappHref } from "@/lib/whatsapp";

/**
 * wa.me link whose prefilled message names the current page (UI §2.5).
 * Server render has the plain number; the title is added after hydration
 * and on every route change.
 */
export function useWhatsAppHref() {
  const t = useTranslations("whatsapp");
  const pathname = usePathname();
  const [href, setHref] = useState(() => whatsappHref());

  useEffect(() => {
    // Wait a frame so the new route's <title> is in place
    const id = requestAnimationFrame(() => {
      const page = document.title.replace(/\s·\sVISAD$/, "") || "visad.al";
      setHref(whatsappHref(t("message", { page })));
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, t]);

  return href;
}
