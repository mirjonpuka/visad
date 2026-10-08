"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitTender } from "@/app/actions/leads";
import type { FormConfig } from "@/lib/forms/config";
import { STAGES, tenderSchema, type TenderValues } from "@/lib/forms/schemas";
import { ChoiceChips, ConsentField, TextAreaField, TextField } from "./fields";
import { FileField } from "./FileField";
import { SecurityFields, SubmitButton, SubmitError, SuccessPanel, useLeadSubmit } from "./LeadForm";
import { useFormState } from "./useFormState";

const INITIAL = {
  company: "",
  contactPerson: "",
  role: "",
  phone: "",
  email: "",
  projectName: "",
  location: "",
  stage: "" as TenderValues["stage"],
  areaM2: "" as string | number,
  deadline: "",
  documents: [] as TenderValues["documents"],
  message: "",
  consent: false as unknown as true,
};

/** Tender / B2B form for architects, developers and public tenders (UI §11.2). */
export function TenderForm({ config }: { config: FormConfig }) {
  const t = useTranslations("form");
  const form = useFormState(tenderSchema, INITIAL);
  const [uploading, setUploading] = useState(false);
  const lead = useLeadSubmit(submitTender, form.setErrors);
  const v = form.values;

  if (lead.status === "success") return <SuccessPanel />;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (uploading) {
      form.setErrors({ documents: "uploading" });
      return;
    }
    if (!form.validate()) return;
    await lead.submit(tenderSchema.parse(v));
  }

  const text = (name: keyof typeof INITIAL & string, label: string, extra: Partial<React.ComponentProps<typeof TextField>> = {}) => (
    <TextField
      name={name}
      label={label}
      value={String(v[name] ?? "")}
      onValue={(value) => form.set(name, value as never)}
      onBlur={() => form.blur(name)}
      error={form.errors[name]}
      {...extra}
    />
  );

  return (
    <form noValidate onSubmit={onSubmit} className="relative flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-2">
        {text("company", t("tender.company"), { required: true, autoComplete: "organization" })}
        {text("contactPerson", t("tender.contactPerson"), { required: true, autoComplete: "name" })}
        {text("role", t("tender.role"), { autoComplete: "organization-title" })}
        {text("phone", t("quote.phone"), { required: true, type: "tel", inputMode: "tel", autoComplete: "tel" })}
        {text("email", t("quote.email"), { required: true, type: "email", autoComplete: "email", className: "md:col-span-2" })}
        {text("projectName", t("tender.projectName"))}
        {text("location", t("tender.location"))}
      </div>
      <ChoiceChips
        name="stage"
        label={t("tender.stage")}
        options={STAGES.map((value) => ({ value, label: t(`tender.stages.${value}`) }))}
        value={v.stage}
        onValue={(value) => form.set("stage", value as TenderValues["stage"])}
      />
      <div className="grid gap-8 md:grid-cols-2">
        {text("areaM2", t("tender.area"), { inputMode: "decimal" })}
        {text("deadline", t("tender.deadline"), { type: "date" })}
      </div>
      <FileField
        name="documents"
        kind="document"
        mode={config.uploadMode}
        label={t("tender.documents")}
        hint={t("tender.documentsHint")}
        error={form.errors.documents}
        onChange={(files) => form.set("documents", files)}
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
      {lead.status === "error" && <SubmitError reason={lead.reason} onRetry={() => lead.submit(tenderSchema.parse(v))} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton busy={lead.status === "submitting"}>{t("send")}</SubmitButton>
        {lead.verifying && <span className="text-body-s text-(--surface-fg-3)">{t("verifying")}</span>}
      </div>
    </form>
  );
}
