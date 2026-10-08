import "server-only";
import { getTranslations } from "next-intl/server";
import { Resend } from "resend";
import { studioLeadsPath } from "@/sanity/env";
import { client } from "@/sanity/lib/client";

/*
 * Lead emails via Resend (Architecture §7.3). Without RESEND_API_KEY the
 * lead is still saved in Sanity and the emails are skipped (logged), so a
 * missing key never loses a request.
 */

const FROM = process.env.LEAD_FROM_EMAIL ?? "VISAD Construction <noreply@visad.al>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://visad.al";

type Row = [label: string, value: string | number | null | undefined];
type FileLink = { url: string; name: string };

function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function table(rows: Row[], files: FileLink[], studioUrl: string) {
  const body = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#5e636b;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="padding:8px 0;white-space:pre-wrap">${escape(String(v))}</td></tr>`,
    )
    .join("");
  const links = files.length
    ? `<p style="margin:24px 0 8px;color:#5e636b">Skedarët</p><ul>${files
        .map((f) => `<li><a href="${escape(f.url)}">${escape(f.name)}</a></li>`)
        .join("")}</ul>`
    : "";
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0e0f11"><table>${body}</table>${links}<p style="margin-top:24px"><a href="${escape(studioUrl)}">Hape në Studio → Kërkesat</a></p></div>`;
}

async function leadEmail() {
  const value = await client
    .fetch<string | null>(`*[_id == "siteSettings"][0].leadEmail`, {}, { cache: "no-store" })
    .catch(() => null);
  return value || "info@visad.al";
}

function resend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/** Notification to the team (always Albanian) */
export async function sendLeadNotification(opts: {
  subject: string;
  rows: Row[];
  files: FileLink[];
  replyTo?: string;
}) {
  const api = resend();
  if (!api) {
    console.warn("[email] RESEND_API_KEY missing — notification skipped:", opts.subject);
    return false;
  }
  const { error } = await api.emails.send({
    from: FROM,
    to: await leadEmail(),
    subject: opts.subject,
    html: table(opts.rows, opts.files, `${SITE_URL}${studioLeadsPath}`),
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
  });
  if (error) console.error("[email] notification failed", error);
  return !error;
}

/** Localized confirmation to the customer (only if they gave an email) */
export async function sendConfirmation(opts: { to: string; name: string; locale: string; whatsappUrl: string }) {
  const api = resend();
  if (!api) {
    console.warn("[email] RESEND_API_KEY missing — confirmation skipped");
    return false;
  }
  const t = await getTranslations({ locale: opts.locale, namespace: "email" });
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0e0f11">
<p>${escape(t("confirmHello", { name: opts.name }))}</p>
<p>${escape(t("confirmBody"))}</p>
<p>${escape(t("confirmWhatsapp"))} <a href="${escape(opts.whatsappUrl)}">WhatsApp</a></p>
<p>— ${escape(t("confirmSign"))}<br><a href="${SITE_URL}">visad.al</a></p></div>`;
  const { error } = await api.emails.send({ from: FROM, to: opts.to, subject: t("confirmSubject"), html });
  if (error) console.error("[email] confirmation failed", error);
  return !error;
}
