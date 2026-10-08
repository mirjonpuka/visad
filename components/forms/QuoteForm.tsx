"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitQuote } from "@/app/actions/leads";
import { ButtonSecondary } from "@/components/ui/Button";
import {
  CONTACT_OPTIONS,
  PROJECT_TYPES,
  quoteSchema,
  quoteStep1,
  type QuoteValues,
  type SYSTEM_KEYS,
} from "@/lib/forms/schemas";
import type { FormConfig } from "@/lib/forms/config";
import { ChoiceChips, ConsentField, Stepper, TextAreaField, TextField } from "./fields";
import { FileField } from "./FileField";
import { SecurityFields, SubmitButton, SubmitError, SuccessPanel, useLeadSubmit } from "./LeadForm";
import { useFormState } from "./useFormState";

type SystemKey = (typeof SYSTEM_KEYS)[number];

const INITIAL = {
  systems: [] as SystemKey[],
  projectType: "" as QuoteValues["projectType"],
  openings: 1,
  dimensions: "",
  city: "",
  name: "",
  phone: "+355 ",
  email: "",
  preferredContact: "whatsapp" as QuoteValues["preferredContact"],
  photos: [] as QuoteValues["photos"],
  message: "",
  consent: false as unknown as true,
};

const STEP1_KEYS = Object.keys(quoteStep1.shape) as (keyof QuoteValues)[];

/** Homeowners' quote form, 2 steps (UI §11.2). */
export function QuoteForm({ config, systems }: { config: FormConfig; systems: { key: SystemKey; title: string }[] }) {
  const t = useTranslations("form");
  const form = useFormState(quoteSchema, INITIAL);
  const [step, setStep] = useState<1 | 2>(1);
  const [uploading, setUploading] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  // Server-side field errors from step 1 bring the user back there
  const lead = useLeadSubmit(submitQuote, (fields) => {
    form.setErrors(fields);
    if (Object.keys(fields).some((k) => STEP1_KEYS.includes(k as keyof QuoteValues))) setStep(1);
  });
  const v = form.values;

  if (lead.status === "success") return <SuccessPanel />;

  const goTo = (next: 1 | 2) => {
    setStep(next);
    requestAnimationFrame(() => {
      top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      top.current?.querySelector<HTMLElement>("h3")?.focus();
    });
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step === 1) {
      if (form.validate(STEP1_KEYS)) goTo(2);
      return;
    }
    if (uploading) {
      form.setErrors({ photos: "uploading" });
      return;
    }
    if (!form.validate(STEP1_KEYS)) {
      goTo(1);
      return;
    }
    if (!form.validate()) return;
    await lead.submit(quoteSchema.parse(v));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative flex flex-col gap-8">
      <div ref={top} className="scroll-mt-32">
        {/* Progress "1 / 2" with a red line (UI §11.2) */}
        <div className="flex items-center justify-between font-mono text-label uppercase tabular text-(--surface-fg-3)">
          <span aria-hidden>
            {step} / 2
          </span>
          <span className="sr-only">{t("step", { n: step, total: 2 })}</span>
        </div>
        <div className="mt-3 h-px bg-(--surface-line)" aria-hidden>
          <div className="h-full bg-red-500 transition-[width] duration-500 ease-out-expo" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>
        <h3 tabIndex={-1} className="mt-8 text-h3 outline-none">
          {step === 1 ? t("quote.step1") : t("quote.step2")}
        </h3>
      </div>

      {step === 1 ? (
        <>
          <ChoiceChips
            name="systems"
            label={t("quote.systems")}
            multiple
            options={systems.map((s) => ({ value: s.key, label: s.title }))}
            value={v.systems}
            onValue={(value) => form.set("systems", value as SystemKey[])}
            error={form.errors.systems}
          />
          <ChoiceChips
            name="projectType"
            label={t("quote.projectType")}
            options={PROJECT_TYPES.map((value) => ({ value, label: t(`quote.projectTypes.${value}`) }))}
            value={v.projectType}
            onValue={(value) => form.set("projectType", value as QuoteValues["projectType"])}
            error={form.errors.projectType}
          />
          <Stepper
            name="openings"
            label={t("quote.openings")}
            value={v.openings}
            onValue={(value) => form.set("openings", value)}
            error={form.errors.openings}
            labels={{ decrease: t("quote.decrease"), increase: t("quote.increase") }}
          />
          <TextAreaField
            name="dimensions"
            label={t("quote.dimensions")}
            placeholder={t("quote.dimensionsHint")}
            rows={3}
            value={v.dimensions}
            onValue={(value) => form.set("dimensions", value)}
            onBlur={() => form.blur("dimensions")}
            error={form.errors.dimensions}
          />
          <TextField
            name="city"
            label={t("quote.city")}
            autoComplete="address-level2"
            value={v.city}
            onValue={(value) => form.set("city", value)}
            onBlur={() => form.blur("city")}
            error={form.errors.city}
          />
          <div>
            <SubmitButton busy={false}>{t("continue")}</SubmitButton>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2">
            <TextField
              name="name"
              label={t("quote.name")}
              required
              autoComplete="name"
              value={v.name}
              onValue={(value) => form.set("name", value)}
              onBlur={() => form.blur("name")}
              error={form.errors.name}
            />
            <TextField
              name="phone"
              label={t("quote.phone")}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={v.phone}
              onValue={(value) => form.set("phone", value)}
              onBlur={() => form.blur("phone")}
              error={form.errors.phone}
            />
          </div>
          <TextField
            name="email"
            label={t("quote.email")}
            type="email"
            autoComplete="email"
            value={v.email}
            onValue={(value) => form.set("email", value)}
            onBlur={() => form.blur("email")}
            error={form.errors.email}
          />
          <ChoiceChips
            name="preferredContact"
            label={t("quote.preferredContact")}
            options={CONTACT_OPTIONS.map((value) => ({ value, label: t(`quote.contactOptions.${value}`) }))}
            value={v.preferredContact}
            onValue={(value) => form.set("preferredContact", value as QuoteValues["preferredContact"])}
          />
          <FileField
            name="photos"
            kind="photo"
            mode={config.uploadMode}
            label={t("quote.photos")}
            hint={t("quote.photosHint")}
            error={form.errors.photos}
            onChange={(files) => form.set("photos", files)}
            onBusy={setUploading}
          />
          <TextAreaField
            name="message"
            label={t("quote.message")}
            value={v.message}
            onValue={(value) => form.set("message", value)}
            onBlur={() => form.blur("message")}
            error={form.errors.message}
          />
          <ConsentField value={Boolean(v.consent)} onValue={(value) => form.set("consent", value as true)} error={form.errors.consent} />
          <SecurityFields siteKey={config.siteKey} honeypotRef={lead.honeypot} turnstileRef={lead.turnstile} onToken={lead.setToken} />
          {lead.status === "error" && <SubmitError reason={lead.reason} onRetry={() => lead.submit(quoteSchema.parse(v))} />}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <ButtonSecondary onClick={() => goTo(1)} className="w-full sm:w-auto">
              ← {t("back")}
            </ButtonSecondary>
            <SubmitButton busy={lead.status === "submitting"}>{t("send")}</SubmitButton>
            {lead.verifying && <span className="text-body-s text-(--surface-fg-3)">{t("verifying")}</span>}
          </div>
        </>
      )}
    </form>
  );
}
