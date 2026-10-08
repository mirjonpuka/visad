"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs } from "@/components/ui/Tabs";
import type { FormConfig } from "@/lib/forms/config";
import type { SYSTEM_KEYS } from "@/lib/forms/schemas";
import { QuoteForm } from "./QuoteForm";
import { TenderForm } from "./TenderForm";

type Tab = "oferte" | "tender";

/**
 * Contact forms (UI §11.2): "Kërko ofertë" (default) and "Tender / B2B"
 * tabs; `?forma=tender` preselects the tender tab (read after hydration so
 * the page stays prerendered).
 */
export function ContactForms({
  config,
  systems,
}: {
  config: FormConfig;
  systems: { key: (typeof SYSTEM_KEYS)[number]; title: string }[];
}) {
  const t = useTranslations("contact");
  const [tab, setTab] = useState<Tab>("oferte");

  useEffect(() => {
    const form = new URLSearchParams(window.location.search).get("forma");
    if (form !== "tender") return;
    const id = requestAnimationFrame(() => setTab("tender"));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Tabs
      label={t("formsLabel")}
      value={tab}
      onValueChange={(id) => setTab(id as Tab)}
      items={[
        { id: "oferte", label: t("tabQuote"), content: <QuoteForm config={config} systems={systems} /> },
        { id: "tender", label: t("tabTender"), content: <TenderForm config={config} /> },
      ]}
    />
  );
}
