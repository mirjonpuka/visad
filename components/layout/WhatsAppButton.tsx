"use client";

import { useTranslations } from "next-intl";
import { ButtonWhatsApp } from "@/components/ui/Button";
import { useWhatsAppHref } from "./useWhatsAppHref";

/** ButtonWhatsApp with the localized, page-aware wa.me link (UI §2.5). */
export function WhatsAppButton({ className, label }: { className?: string; label?: string }) {
  const t = useTranslations("cta");
  const href = useWhatsAppHref();
  return (
    <ButtonWhatsApp externalHref={href} newTab className={className}>
      {label ?? t("whatsapp")}
    </ButtonWhatsApp>
  );
}
