"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendConfirmation, sendLeadNotification } from "@/lib/email";
import { rateLimited } from "@/lib/forms/rate-limit";
import {
  fieldErrors,
  jobSchema,
  quoteSchema,
  submissionMeta,
  tenderSchema,
  type JobValues,
  type QuoteValues,
  type SubmissionMeta,
  type TenderValues,
} from "@/lib/forms/schemas";
import { verifyTurnstile } from "@/lib/forms/turnstile";
import { whatsappHref } from "@/lib/whatsapp";
import { client } from "@/sanity/lib/client";
import { leadsWriteClient } from "@/sanity/lib/server";

/*
 * Lead submissions (Architecture §7.3): honeypot → rate limit → Turnstile →
 * zod (same schemas as the client) → document in the private "leads"
 * dataset → notification + confirmation emails. The user's data stays in
 * the form on any error.
 */

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "spam" | "rate" | "server"; fields?: Record<string, string> };

const PROJECT_TYPE_SQ: Record<string, string> = {
  "new-house": "Shtëpi e re",
  renovation: "Rinovim",
  "apartment-building": "Pallat",
  business: "Biznes",
};
const STAGE_SQ: Record<string, string> = { design: "Projektim", tender: "Tender", construction: "Ndërtim" };
const CONTACT_SQ: Record<string, string> = { whatsapp: "WhatsApp", phone: "Telefon", email: "Email" };

async function guard(meta: unknown): Promise<{ meta: SubmissionMeta } | { fail: LeadResult; honeypot?: boolean }> {
  const parsed = submissionMeta.safeParse(meta);
  if (!parsed.success) return { fail: { ok: false, reason: "invalid" } };
  // Bots fill every field: pretend success, store nothing
  if (parsed.data.website) return { fail: { ok: true }, honeypot: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return { fail: { ok: false, reason: "rate" } };
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) return { fail: { ok: false, reason: "spam" } };
  return { meta: parsed.data };
}

async function whatsappUrl() {
  const number = await client
    .fetch<string | null>(`*[_id == "siteSettings"][0].whatsappNumber`, {}, { cache: "no-store" })
    .catch(() => null);
  return whatsappHref(number || "355673772989");
}

async function save(doc: Record<string, unknown>) {
  return leadsWriteClient().create({ ...doc, status: "new", createdAt: new Date().toISOString() } as never);
}

function invalid(error: z.ZodError): LeadResult {
  return { ok: false, reason: "invalid", fields: fieldErrors(error) };
}

export async function submitQuote(values: QuoteValues, meta: SubmissionMeta): Promise<LeadResult> {
  const check = await guard(meta);
  if ("fail" in check) return check.fail;
  const parsed = quoteSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  try {
    await save({
      _type: "quoteRequest",
      locale: check.meta.locale,
      sourcePage: check.meta.sourcePage,
      name: v.name,
      phone: v.phone,
      email: v.email || undefined,
      preferredContact: v.preferredContact,
      systems: v.systems,
      projectType: v.projectType || undefined,
      openings: v.openings,
      dimensions: v.dimensions || undefined,
      city: v.city || undefined,
      photos: v.photos.map((f, i) => ({ _key: `p${i}`, _type: "uploadedFile", ...f })),
      message: v.message || undefined,
      consent: true,
    });
  } catch (error) {
    console.error("[lead] quote save failed", error);
    return { ok: false, reason: "server" };
  }

  await Promise.allSettled([
    sendLeadNotification({
      subject: `Kërkesë e re për ofertë — ${v.name}${v.city ? `, ${v.city}` : ""}`,
      rows: [
        ["Emri", v.name],
        ["Telefoni", v.phone],
        ["Email", v.email],
        ["Si të kontaktohet", CONTACT_SQ[v.preferredContact]],
        ["Sistemet", v.systems.join(", ")],
        ["Lloji i projektit", PROJECT_TYPE_SQ[v.projectType] ?? ""],
        ["Numri i hapjeve", v.openings],
        ["Masat", v.dimensions],
        ["Qyteti", v.city],
        ["Mesazhi", v.message],
        ["Gjuha", check.meta.locale.toUpperCase()],
        ["Faqja", check.meta.sourcePage],
      ],
      files: v.photos,
      replyTo: v.email || undefined,
    }),
    v.email
      ? sendConfirmation({ to: v.email, name: v.name, locale: check.meta.locale, whatsappUrl: await whatsappUrl() })
      : Promise.resolve(false),
  ]);
  return { ok: true };
}

export async function submitTender(values: TenderValues, meta: SubmissionMeta): Promise<LeadResult> {
  const check = await guard(meta);
  if ("fail" in check) return check.fail;
  const parsed = tenderSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  try {
    await save({
      _type: "tenderRequest",
      locale: check.meta.locale,
      company: v.company,
      contactPerson: v.contactPerson,
      role: v.role || undefined,
      phone: v.phone,
      email: v.email,
      projectName: v.projectName || undefined,
      location: v.location || undefined,
      stage: v.stage || undefined,
      areaM2: v.areaM2 === "" ? undefined : v.areaM2,
      deadline: v.deadline || undefined,
      documents: v.documents.map((f, i) => ({ _key: `d${i}`, _type: "uploadedFile", ...f })),
      message: v.message || undefined,
      consent: true,
    });
  } catch (error) {
    console.error("[lead] tender save failed", error);
    return { ok: false, reason: "server" };
  }

  await Promise.allSettled([
    sendLeadNotification({
      subject: `Tender / B2B — ${v.company}${v.projectName ? `: ${v.projectName}` : ""}`,
      rows: [
        ["Kompania", v.company],
        ["Personi i kontaktit", v.contactPerson],
        ["Pozicioni", v.role],
        ["Telefoni", v.phone],
        ["Email", v.email],
        ["Projekti", v.projectName],
        ["Vendndodhja", v.location],
        ["Faza", STAGE_SQ[v.stage] ?? ""],
        ["Sipërfaqja (m²)", v.areaM2 === "" ? "" : v.areaM2],
        ["Afati", v.deadline],
        ["Mesazhi", v.message],
        ["Gjuha", check.meta.locale.toUpperCase()],
      ],
      files: v.documents,
      replyTo: v.email,
    }),
    sendConfirmation({ to: v.email, name: v.contactPerson, locale: check.meta.locale, whatsappUrl: await whatsappUrl() }),
  ]);
  return { ok: true };
}

export async function submitJobApplication(values: JobValues, meta: SubmissionMeta): Promise<LeadResult> {
  const check = await guard(meta);
  if ("fail" in check) return check.fail;
  const parsed = jobSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;
  const job = check.meta.job;

  try {
    await save({
      _type: "jobApplication",
      locale: check.meta.locale,
      ...(job ? { job: { title: job.title, slug: job.id } } : {}),
      name: v.name,
      phone: v.phone,
      email: v.email || undefined,
      cv: { url: v.cv[0].url, name: v.cv[0].name },
      message: v.message || undefined,
      consent: true,
    });
  } catch (error) {
    console.error("[lead] job application save failed", error);
    return { ok: false, reason: "server" };
  }

  await Promise.allSettled([
    sendLeadNotification({
      subject: `Aplikim pune — ${v.name}${job ? ` (${job.title})` : ""}`,
      rows: [
        ["Pozicioni", job?.title ?? "Aplikim i përgjithshëm"],
        ["Emri", v.name],
        ["Telefoni", v.phone],
        ["Email", v.email],
        ["Mesazhi", v.message],
      ],
      files: v.cv,
      replyTo: v.email || undefined,
    }),
    v.email
      ? sendConfirmation({ to: v.email, name: v.name, locale: check.meta.locale, whatsappUrl: await whatsappUrl() })
      : Promise.resolve(false),
  ]);
  return { ok: true };
}
