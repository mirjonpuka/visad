import { icon } from "../icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/*
 * Form submissions, stored in the private "leads" dataset and written only by
 * the server (Architecture §7). Editors may change status and notes.
 */

export const leadStatuses = [
  { title: "E re", value: "new" },
  { title: "U kontaktua", value: "contacted" },
  { title: "Oferta u dërgua", value: "offer-sent" },
  { title: "Fituar", value: "won" },
  { title: "Humbur", value: "lost" },
];

const ro = { readOnly: true };

const statusField = defineField({
  name: "status",
  title: "Statusi",
  type: "string",
  options: { list: leadStatuses, layout: "radio", direction: "horizontal" },
  initialValue: "new",
});
const notesField = defineField({ name: "notes", title: "Shënime të brendshme", type: "text", rows: 4 });
const createdAt = defineField({ name: "createdAt", title: "Data", type: "datetime", ...ro });
const locale = defineField({ name: "locale", title: "Gjuha", type: "string", ...ro });

const fileList = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    ...ro,
    of: [
      defineArrayMember({
        type: "object",
        name: "uploadedFile",
        fields: [
          defineField({ name: "url", title: "URL", type: "url" }),
          defineField({ name: "name", title: "Emri", type: "string" }),
          defineField({ name: "size", title: "Madhësia (bytes)", type: "number" }),
        ],
        preview: { select: { title: "name", subtitle: "url" } },
      }),
    ],
  });

const statusLabel = (value?: string) => leadStatuses.find((s) => s.value === value)?.title ?? "E re";
const date = (value?: string) => (value ? new Date(value).toLocaleString("sq-AL") : "");

export const quoteRequest = defineType({
  name: "quoteRequest",
  title: "Kërkesë për ofertë",
  type: "document",
  icon: icon("envelope"),
  fields: [
    statusField,
    notesField,
    createdAt,
    locale,
    defineField({ name: "name", title: "Emri", type: "string", ...ro }),
    defineField({ name: "phone", title: "Telefoni", type: "string", ...ro }),
    defineField({ name: "email", title: "Email", type: "string", ...ro }),
    defineField({ name: "preferredContact", title: "Si të kontaktohet", type: "string", ...ro }),
    defineField({ name: "systems", title: "Sistemet", type: "array", of: [{ type: "string" }], ...ro }),
    defineField({ name: "projectType", title: "Lloji i projektit", type: "string", ...ro }),
    defineField({ name: "openings", title: "Numri i hapjeve", type: "number", ...ro }),
    defineField({ name: "dimensions", title: "Masat", type: "text", ...ro }),
    defineField({ name: "city", title: "Qyteti", type: "string", ...ro }),
    fileList("photos", "Fotot"),
    defineField({ name: "message", title: "Mesazhi", type: "text", ...ro }),
    defineField({ name: "consent", title: "Pranoi privatësinë", type: "boolean", ...ro }),
    defineField({ name: "sourcePage", title: "Faqja", type: "string", ...ro }),
  ],
  orderings: [
    { title: "Më të rejat", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { name: "name", city: "city", status: "status", createdAt: "createdAt" },
    prepare: ({ name, city, status, createdAt }) => ({
      title: name ?? "Pa emër",
      subtitle: [statusLabel(status), city, date(createdAt)].filter(Boolean).join(" · "),
    }),
  },
});

export const tenderRequest = defineType({
  name: "tenderRequest",
  title: "Tender / B2B",
  type: "document",
  icon: icon("case"),
  fields: [
    statusField,
    notesField,
    createdAt,
    locale,
    defineField({ name: "company", title: "Kompania", type: "string", ...ro }),
    defineField({ name: "contactPerson", title: "Personi i kontaktit", type: "string", ...ro }),
    defineField({ name: "role", title: "Pozicioni", type: "string", ...ro }),
    defineField({ name: "phone", title: "Telefoni", type: "string", ...ro }),
    defineField({ name: "email", title: "Email", type: "string", ...ro }),
    defineField({ name: "projectName", title: "Emri i projektit", type: "string", ...ro }),
    defineField({ name: "location", title: "Vendndodhja", type: "string", ...ro }),
    defineField({ name: "stage", title: "Faza", type: "string", ...ro }),
    defineField({ name: "areaM2", title: "Sipërfaqja (m²)", type: "number", ...ro }),
    defineField({ name: "deadline", title: "Afati", type: "date", ...ro }),
    fileList("documents", "Dokumentet"),
    defineField({ name: "message", title: "Mesazhi", type: "text", ...ro }),
    defineField({ name: "consent", title: "Pranoi privatësinë", type: "boolean", ...ro }),
  ],
  orderings: [
    { title: "Më të rejat", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { company: "company", projectName: "projectName", status: "status", createdAt: "createdAt" },
    prepare: ({ company, projectName, status, createdAt }) => ({
      title: company ?? "Pa emër",
      subtitle: [statusLabel(status), projectName, date(createdAt)].filter(Boolean).join(" · "),
    }),
  },
});

export const jobApplication = defineType({
  name: "jobApplication",
  title: "Aplikim pune",
  type: "document",
  icon: icon("user"),
  fields: [
    statusField,
    notesField,
    createdAt,
    locale,
    defineField({
      name: "job",
      title: "Pozicioni",
      type: "object",
      ...ro,
      fields: [
        defineField({ name: "title", title: "Titulli", type: "string" }),
        defineField({ name: "slug", title: "Slug", type: "string" }),
      ],
    }),
    defineField({ name: "name", title: "Emri", type: "string", ...ro }),
    defineField({ name: "phone", title: "Telefoni", type: "string", ...ro }),
    defineField({ name: "email", title: "Email", type: "string", ...ro }),
    defineField({
      name: "cv",
      title: "CV",
      type: "object",
      ...ro,
      fields: [
        defineField({ name: "url", title: "URL", type: "url" }),
        defineField({ name: "name", title: "Emri", type: "string" }),
      ],
    }),
    defineField({ name: "message", title: "Mesazhi", type: "text", ...ro }),
    defineField({ name: "consent", title: "Pranoi privatësinë", type: "boolean", ...ro }),
  ],
  orderings: [
    { title: "Më të rejat", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { name: "name", job: "job.title", status: "status", createdAt: "createdAt" },
    prepare: ({ name, job, status, createdAt }) => ({
      title: name ?? "Pa emër",
      subtitle: [statusLabel(status), job ?? "Aplikim i përgjithshëm", date(createdAt)]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

export const leadTypes = [quoteRequest, tenderRequest, jobApplication];
export const leadTypeNames = leadTypes.map((t) => t.name);
