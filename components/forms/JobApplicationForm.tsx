"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitJobApplication } from "@/app/actions/leads";
import type { FormConfig } from "@/lib/forms/config";
import { jobSchema, type JobValues } from "@/lib/forms/schemas";
import { ConsentField, TextAreaField, TextField } from "./fields";
import { FileField } from "./FileField";
import { SecurityFields, SubmitButton, SubmitError, SuccessPanel, useLeadSubmit } from "./LeadForm";
import { useFormState } from "./useFormState";

const INITIAL = {
  name: "",
  phone: "+355 ",
  email: "",
  cv: [] as JobValues["cv"],
  message: "",
  consent: false as unknown as true,
};

/** Job application (UI §10): name, phone, email, CV (PDF ≤ 5MB), message, consent. */
export function JobApplicationForm({ config, job }: { config: FormConfig; job?: { id: string; title: string } }) {
  const t = useTranslations("form");
  const form = useFormState(jobSchema, INITIAL);
  const [uploading, setUploading] = useState(false);
  const lead = useLeadSubmit(submitJobApplication, form.setErrors);
  const v = form.values;

  if (lead.status === "success") return <SuccessPanel />;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (uploading) {
      form.setErrors({ cv: "uploading" });
      return;
    }
    if (!form.validate()) return;
    await lead.submit(jobSchema.parse(v), job);
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative flex flex-col gap-8">
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
      <div className="grid gap-8 md:grid-cols-2">
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
      </div>
      <FileField
        name="cv"
        kind="cv"
        mode={config.uploadMode}
        label={t("job.cv")}
        hint={t("job.cvHint")}
        required
        error={form.errors.cv}
        onChange={(files) => form.set("cv", files)}
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
      {lead.status === "error" && (
        <SubmitError reason={lead.reason} onRetry={() => lead.submit(jobSchema.parse(v), job)} />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton busy={lead.status === "submitting"}>{t("send")}</SubmitButton>
        {lead.verifying && <span className="text-body-s text-(--surface-fg-3)">{t("verifying")}</span>}
      </div>
    </form>
  );
}
