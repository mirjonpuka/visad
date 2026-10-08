import { z } from "zod";
import { isTrustedUploadUrl, UPLOAD_KINDS } from "./uploads";

/*
 * Form schemas (Architecture §7.1), used by the client (on blur / on step)
 * and re-checked by the server actions. Error messages are keys of
 * messages → form.errors.
 */

const text = (max: number) => z.string().trim().max(max, "tooLong");
const required = (max = 200) => text(max).min(1, "required");

// +355 67 377 2989, 0673772989, +39 333 1234567 …: 8–15 digits
export const phone = z
  .string()
  .trim()
  .min(1, "required")
  .refine((v) => /^\+?[\d\s().-]+$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 8 && (v.match(/\d/g)?.length ?? 0) <= 15, "phone");

const optionalEmail = z.union([z.literal(""), z.email("email").max(200)]);

export const uploadedFile = z.object({
  url: z.string().refine(isTrustedUploadUrl, "fileType"),
  name: z.string().max(200),
  size: z.number().int().nonnegative(),
});
export type UploadedFile = z.infer<typeof uploadedFile>;

const consent = z.literal(true, { error: "consent" });

export const SYSTEM_KEYS = ["dyer", "dritare", "sisteme-rreshqitese", "grila", "ballkone-parmake", "fasada"] as const;
export const PROJECT_TYPES = ["new-house", "renovation", "apartment-building", "business"] as const;
export const CONTACT_OPTIONS = ["whatsapp", "phone", "email"] as const;
export const STAGES = ["design", "tender", "construction"] as const;

// ---------------------------------------------------------------------------
// Quote (UI §11.2): 2 steps
// ---------------------------------------------------------------------------

export const quoteStep1 = z.object({
  systems: z.array(z.enum(SYSTEM_KEYS)).max(SYSTEM_KEYS.length),
  projectType: z.union([z.literal(""), z.enum(PROJECT_TYPES)]),
  openings: z.number({ error: "number" }).int("number").min(1, "number").max(999, "number"),
  dimensions: text(2000),
  city: text(100),
});

export const quoteStep2 = z.object({
  name: required(120),
  phone,
  email: optionalEmail,
  preferredContact: z.enum(CONTACT_OPTIONS),
  photos: z.array(uploadedFile).max(UPLOAD_KINDS.photo.maxFiles),
  message: text(3000),
  consent,
});

export const quoteSchema = quoteStep1.extend(quoteStep2.shape);
export type QuoteValues = z.infer<typeof quoteSchema>;

// ---------------------------------------------------------------------------
// Tender / B2B
// ---------------------------------------------------------------------------

export const tenderSchema = z.object({
  company: required(160),
  contactPerson: required(120),
  role: text(120),
  phone,
  email: z.email("email").max(200),
  projectName: text(200),
  location: text(160),
  stage: z.union([z.literal(""), z.enum(STAGES)]),
  areaM2: z.union([z.literal(""), z.coerce.number({ error: "number" }).positive("number").max(10_000_000, "number")]),
  deadline: z.union([z.literal(""), z.iso.date("required")]),
  documents: z.array(uploadedFile).max(UPLOAD_KINDS.document.maxFiles),
  message: text(5000),
  consent,
});
export type TenderValues = z.infer<typeof tenderSchema>;

// ---------------------------------------------------------------------------
// Job application (UI §10)
// ---------------------------------------------------------------------------

export const jobSchema = z.object({
  name: required(120),
  phone,
  email: optionalEmail,
  cv: z.array(uploadedFile).length(1, "cv"),
  message: text(3000),
  consent,
});
export type JobValues = z.infer<typeof jobSchema>;

/** Fields every submission carries besides the form values. */
export const submissionMeta = z.object({
  locale: z.enum(["sq", "en", "it", "de"]),
  sourcePage: z.string().max(300),
  turnstileToken: z.string().max(4096),
  /** Honeypot: humans never fill it */
  website: z.string().max(500),
  job: z.object({ id: z.string().max(100), title: z.string().max(200) }).optional(),
});
export type SubmissionMeta = z.infer<typeof submissionMeta>;

/** zod issues → { field: messageKey } (first issue per field) */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
