import { icon } from "../icons";
import { defineArrayMember, defineField, defineType, type ArrayRule } from "sanity";
import { firstValue, requireSq, type I18nItem } from "./helpers";

type ImageValue = { isPlaceholder?: boolean } | undefined;

/** Projects may only use real Visad photos (Brand §5, CMS §3 project). */
const PLACEHOLDER_NOT_ALLOWED = "Te projektet lejohen vetëm foto reale të Visad (jo foto të përkohshme).";
function noPlaceholderInGallery(rule: ArrayRule<unknown[]>) {
  return rule.custom((value) => {
    const bad = ((value ?? []) as ImageValue[]).findIndex((img) => img?.isPlaceholder);
    return bad === -1
      ? true
      : `Foto ${bad + 1} është shënuar si e përkohshme. Te projektet lejohen vetëm foto reale.`;
  });
}

const titleField = (title = "Titulli") =>
  defineField({ name: "title", title, type: "internationalizedArrayString", validation: requireSq });

const slugField = defineField({
  name: "slug",
  title: "Adresa (slug) për çdo gjuhë",
  type: "internationalizedArraySlug",
  description: "Gjenerohet nga titulli në të njëjtën gjuhë. Përdoret në adresën e faqes.",
  validation: requireSq,
});

const seoField = defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });
const seoGroup = { name: "seo", title: "SEO" };

// ---------------------------------------------------------------------------
// Singletons
// ---------------------------------------------------------------------------

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Cilësimet e faqes",
  type: "document",
  icon: icon("cog"),
  fields: [
    defineField({ name: "companyName", title: "Emri i kompanisë", type: "string" }),
    defineField({ name: "address", title: "Adresa", type: "internationalizedArrayText" }),
    defineField({ name: "geo", title: "Vendndodhja në hartë", type: "geopoint" }),
    defineField({
      name: "phones",
      title: "Telefonat",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "phone",
          fields: [
            defineField({ name: "label", title: "Etiketa", type: "string" }),
            defineField({
              name: "number",
              title: "Numri",
              type: "string",
              description: "p.sh. +355 67 377 2989",
            }),
          ],
          preview: { select: { title: "number", subtitle: "label" } },
        }),
      ],
    }),
    defineField({
      name: "whatsappNumber",
      title: "Numri WhatsApp",
      type: "string",
      description: "Vetëm shifra, me prefiksin e shtetit, p.sh. 355673772989",
      validation: (r) => r.regex(/^\d{8,15}$/, { name: "digits" }),
    }),
    defineField({
      name: "whatsappMessage",
      title: "Mesazhi i parambushur në WhatsApp",
      type: "internationalizedArrayString",
      description: "{page} zëvendësohet me titullin e faqes.",
    }),
    defineField({ name: "email", title: "Email publik", type: "string" }),
    defineField({ name: "leadEmail", title: "Email për njoftimet e formularëve", type: "string" }),
    defineField({
      name: "openingHours",
      title: "Orari",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "openingHour",
          fields: [
            defineField({ name: "days", title: "Ditët", type: "internationalizedArrayString" }),
            defineField({ name: "hours", title: "Orët", type: "string", description: "p.sh. 08:00–17:00" }),
          ],
          preview: {
            select: { days: "days", hours: "hours" },
            prepare: ({ days, hours }) => ({ title: firstValue(days), subtitle: hours }),
          },
        }),
      ],
    }),
    defineField({
      name: "social",
      title: "Rrjetet sociale",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              title: "Platforma",
              type: "string",
              options: { list: ["facebook", "instagram", "linkedin", "tiktok", "youtube"] },
            }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
          preview: { select: { title: "platform", subtitle: "url" } },
        }),
      ],
    }),
    defineField({
      name: "stats",
      title: "Numrat (duhet të konfirmohen nga klienti)",
      type: "array",
      of: [defineArrayMember({ type: "stat" })],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "alumilPartner",
      title: "Partner ALUMIL",
      type: "object",
      fields: [
        defineField({ name: "logo", title: "Logo zyrtare e partnerit", type: "imageWithAlt" }),
        defineField({
          name: "certificate",
          title: "Certifikata (PDF)",
          type: "file",
          options: { accept: "application/pdf" },
        }),
        defineField({ name: "text", title: "Teksti", type: "internationalizedArrayText" }),
      ],
    }),
    defineField({ name: "defaultSeo", title: "SEO e paracaktuar", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Cilësimet e faqes" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Kryefaqja",
  type: "document",
  icon: icon("home"),
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Seksionet" },
    seoGroup,
  ],
  fields: [
    defineField({ name: "heroImage", title: "Foto e hero-s", type: "imageWithAlt", group: "hero" }),
    defineField({
      name: "heroVideo",
      title: "Video (opsionale, ≤ 4MB, MP4)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      group: "hero",
    }),
    defineField({
      name: "heroEyebrow",
      title: "Mbititulli",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroTitle",
      title: "Titulli (rresht i ri = Enter)",
      type: "internationalizedArrayText",
      group: "hero",
      validation: requireSq,
    }),
    defineField({
      name: "heroLead",
      title: "Teksti hyrës",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroCtas",
      title: "Butonat",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
      validation: (r) => r.max(2),
      group: "hero",
    }),
    defineField({
      name: "profileStoryTitle",
      title: "3D: titulli",
      type: "internationalizedArrayString",
      group: "sections",
    }),
    defineField({
      name: "profileStorySteps",
      title: "3D: 5 hapat",
      type: "array",
      of: [defineArrayMember({ type: "step" })],
      validation: (r) => r.max(5),
      group: "sections",
    }),
    defineField({
      name: "systemsTitle",
      title: "Sistemet: titulli",
      type: "internationalizedArrayString",
      group: "sections",
    }),
    defineField({
      name: "featuredProjectsTitle",
      title: "Projektet: titulli",
      type: "internationalizedArrayString",
      group: "sections",
    }),
    defineField({
      name: "featuredProjectsIntro",
      title: "Projektet: hyrja",
      type: "internationalizedArrayText",
      group: "sections",
    }),
    defineField({
      name: "factoryTitle",
      title: "Fabrika: titulli",
      type: "internationalizedArrayText",
      group: "sections",
    }),
    defineField({
      name: "factoryText",
      title: "Fabrika: teksti",
      type: "internationalizedArrayText",
      group: "sections",
    }),
    defineField({
      name: "factorySteps",
      title: "Fabrika: 3 hapat",
      type: "array",
      of: [defineArrayMember({ type: "step" })],
      validation: (r) => r.max(3),
      group: "sections",
    }),
    defineField({
      name: "factoryImages",
      title: "Fabrika: 3 foto",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (r) => r.max(3),
      group: "sections",
    }),
    defineField({
      name: "solutionsTitle",
      title: "Zgjidhje: titulli",
      type: "internationalizedArrayString",
      group: "sections",
    }),
    defineField({
      name: "ctaTitle",
      title: "CTA: titulli",
      type: "internationalizedArrayString",
      group: "sections",
    }),
    defineField({
      name: "ctaText",
      title: "CTA: teksti",
      type: "internationalizedArrayText",
      group: "sections",
    }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Kryefaqja" }) },
});

export const factoryPage = defineType({
  name: "factoryPage",
  title: "Faqja e fabrikës",
  type: "document",
  icon: icon("block-element"),
  groups: [{ name: "content", title: "Përmbajtja", default: true }, seoGroup],
  fields: [
    defineField({ name: "heroImage", title: "Foto e hero-s", type: "imageWithAlt", group: "content" }),
    defineField({
      name: "heroVideo",
      title: "Video (opsionale)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      group: "content",
    }),
    defineField({ ...titleField(), group: "content" }),
    defineField({ name: "intro", title: "Hyrja", type: "internationalizedArrayText", group: "content" }),
    defineField({
      name: "stats",
      title: "Numrat (vetëm vlera reale)",
      type: "array",
      of: [defineArrayMember({ type: "stat" })],
      validation: (r) => r.max(4),
      group: "content",
    }),
    defineField({
      name: "processSteps",
      title: "Procesi (4–5 hapa)",
      type: "array",
      of: [defineArrayMember({ type: "step" })],
      validation: (r) => r.max(5),
      group: "content",
    }),
    defineField({
      name: "machinery",
      title: "Makineritë",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "machine",
          fields: [
            defineField({ name: "image", title: "Foto", type: "imageWithAlt" }),
            defineField({ name: "caption", title: "Përshkrimi", type: "internationalizedArrayString" }),
          ],
          preview: {
            select: { caption: "caption", media: "image" },
            prepare: ({ caption, media }) => ({ title: firstValue(caption) ?? "Makineri", media }),
          },
        }),
      ],
      group: "content",
    }),
    defineField({
      name: "certificates",
      title: "Certifikatat",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "certificate" }] })],
      group: "content",
    }),
    defineField({
      name: "team",
      title: "Ekipi (fshihet nëse është bosh)",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "member",
          fields: [
            defineField({ name: "name", title: "Emri", type: "string" }),
            defineField({ name: "role", title: "Roli", type: "internationalizedArrayString" }),
            defineField({ name: "photo", title: "Foto", type: "imageWithAlt" }),
          ],
          preview: { select: { title: "name", media: "photo" } },
        }),
      ],
      group: "content",
    }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Faqja e fabrikës" }) },
});

/** Heroes and intros of the index pages that have no document of their own. */
export const pageSettings = defineType({
  name: "pageSettings",
  title: "Faqet e tjera",
  type: "document",
  icon: icon("documents"),
  groups: [
    { name: "systems", title: "Sistemet", default: true },
    { name: "projects", title: "Projektet" },
    { name: "careers", title: "Karriera" },
    { name: "contact", title: "Kontakt" },
  ],
  fields: [
    defineField({
      name: "systemsHero",
      title: "Sistemet: foto e hero-s",
      type: "imageWithAlt",
      group: "systems",
    }),
    defineField({
      name: "systemsTitle",
      title: "Sistemet: titulli",
      type: "internationalizedArrayText",
      group: "systems",
    }),
    defineField({
      name: "systemsIntro",
      title: "Sistemet: hyrja (rreth sistemeve ALUMIL)",
      type: "internationalizedArrayText",
      group: "systems",
    }),
    defineField({
      name: "systemsKeySpecs",
      title: "Sistemet: 3 vlera kryesore (vetëm nga fletët teknike ALUMIL)",
      type: "array",
      of: [defineArrayMember({ type: "spec" })],
      validation: (r) => r.max(3),
      group: "systems",
    }),
    defineField({
      name: "projectsIntro",
      title: "Projektet: hyrja",
      type: "internationalizedArrayText",
      group: "projects",
    }),
    defineField({
      name: "careersHero",
      title: "Karriera: foto e hero-s",
      type: "imageWithAlt",
      group: "careers",
    }),
    defineField({
      name: "careersIntro",
      title: "Karriera: hyrja",
      type: "internationalizedArrayText",
      group: "careers",
    }),
    defineField({
      name: "careersBenefits",
      title: "Karriera: përfitimet (4)",
      type: "array",
      of: [defineArrayMember({ type: "benefit" })],
      validation: (r) => r.max(4),
      group: "careers",
    }),
    defineField({
      name: "contactLead",
      title: "Kontakt: teksti hyrës",
      type: "internationalizedArrayText",
      group: "contact",
    }),
  ],
  preview: { prepare: () => ({ title: "Faqet e tjera" }) },
});

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export const system = defineType({
  name: "system",
  title: "Sistem",
  type: "document",
  icon: icon("stack"),
  groups: [
    { name: "basic", title: "Bazë", default: true },
    { name: "details", title: "Detaje teknike" },
    seoGroup,
  ],
  fields: [
    defineField({ ...titleField(), group: "basic" }),
    defineField({ ...slugField, group: "basic" }),
    defineField({
      name: "order",
      title: "Renditja",
      type: "number",
      group: "basic",
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: "shortDescription",
      title: "Përshkrim i shkurtër (1–2 fjali)",
      type: "internationalizedArrayText",
      group: "basic",
      validation: requireSq,
    }),
    defineField({ name: "heroImage", title: "Foto kryesore (4:5)", type: "imageWithAlt", group: "basic" }),
    defineField({
      name: "accordionImage",
      title: "Foto për kryefaqen",
      type: "imageWithAlt",
      group: "basic",
    }),
    defineField({
      name: "thumbnail",
      title: "Foto e vogël (menu, 16:10)",
      type: "imageWithAlt",
      group: "basic",
    }),
    defineField({
      name: "overview",
      title: "Përmbledhje",
      type: "internationalizedArrayBlockContent",
      group: "details",
    }),
    defineField({
      name: "benefits",
      title: "Avantazhet (deri në 4)",
      type: "array",
      of: [defineArrayMember({ type: "benefit" })],
      validation: (r) => r.max(4),
      group: "details",
    }),
    defineField({
      name: "series",
      title: "Seritë ALUMIL",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "systemSeries" }] })],
      group: "details",
    }),
    defineField({
      name: "specs",
      title: "Tabela teknike (vetëm vlera nga fletët teknike ALUMIL)",
      type: "array",
      of: [defineArrayMember({ type: "spec" })],
      group: "details",
    }),
    defineField({ name: "crossSection", title: "Vizatim prerjeje", type: "imageWithAlt", group: "details" }),
    defineField({
      name: "finishes",
      title: "Ngjyrat dhe përfundimet",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "finish" }] })],
      group: "details",
    }),
    defineField({
      name: "downloads",
      title: "Shkarkime",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "download" }] })],
      group: "details",
    }),
    defineField({
      name: "faqs",
      title: "Pyetje",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      group: "details",
    }),
    seoField,
  ],
  orderings: [{ title: "Renditja", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", order: "order", media: "thumbnail" },
    prepare: ({ title, order, media }) => ({
      title: firstValue(title),
      subtitle: order ? `#${order}` : undefined,
      media,
    }),
  },
});

export const systemSeries = defineType({
  name: "systemSeries",
  title: "Seri ALUMIL",
  type: "document",
  icon: icon("component"),
  fields: [
    defineField({ name: "title", title: "Emri i serisë", type: "string", validation: (r) => r.required() }),
    defineField({ name: "system", title: "Sistemi", type: "reference", to: [{ type: "system" }] }),
    defineField({ name: "image", title: "Foto", type: "imageWithAlt" }),
    defineField({
      name: "specs",
      title: "Specifika (3 kryesoret)",
      type: "array",
      of: [defineArrayMember({ type: "spec" })],
    }),
    defineField({ name: "datasheet", title: "Fleta teknike", type: "reference", to: [{ type: "download" }] }),
    defineField({ name: "description", title: "Përshkrimi", type: "internationalizedArrayText" }),
  ],
  preview: { select: { title: "title", subtitle: "system.title.0.value", media: "image" } },
});

export const finish = defineType({
  name: "finish",
  title: "Ngjyrë / përfundim",
  type: "document",
  icon: icon("color-wheel"),
  fields: [
    defineField({ name: "name", title: "Emri", type: "internationalizedArrayString", validation: requireSq }),
    defineField({ name: "code", title: "Kodi", type: "string", description: 'p.sh. "RAL 7016"' }),
    defineField({
      name: "type",
      title: "Lloji",
      type: "string",
      options: { list: ["RAL", "anodised", "wood-effect", "texture"] },
    }),
    defineField({ name: "swatch", title: "Ngjyra", type: "color" }),
    defineField({ name: "image", title: "Ose foto e mostrës", type: "imageWithAlt" }),
  ],
  preview: {
    select: { name: "name", code: "code", media: "image" },
    prepare: ({ name, code, media }) => ({ title: firstValue(name), subtitle: code, media }),
  },
});

const projectTypes = [
  { title: "Banim", value: "residential" },
  { title: "Vila", value: "villa" },
  { title: "Hotel", value: "hotel" },
  { title: "Komercial", value: "commercial" },
  { title: "Publik", value: "public" },
];
const audiences = [
  { title: "Pronarë shtëpish", value: "homeowners" },
  { title: "Zhvillues & ndërtues", value: "developers" },
  { title: "Hotele & turizëm", value: "hotels" },
  { title: "Arkitektë & tendera", value: "architects" },
];

/** The type the client edits most: kept simple (CMS §3 project). */
export const project = defineType({
  name: "project",
  title: "Projekt",
  type: "document",
  icon: icon("images"),
  groups: [{ name: "basic", title: "Bazë", default: true }, { name: "more", title: "Më shumë" }, seoGroup],
  fields: [
    defineField({ ...titleField("Emri i projektit"), group: "basic" }),
    defineField({ ...slugField, group: "basic" }),
    defineField({
      name: "coverImage",
      title: "Foto kryesore",
      type: "imageWithAlt",
      group: "basic",
      validation: (r) =>
        r
          .required()
          .error("Projekti ka nevojë për një foto kryesore.")
          .custom((value) => ((value as ImageValue)?.isPlaceholder ? PLACEHOLDER_NOT_ALLOWED : true)),
    }),
    defineField({
      name: "city",
      title: "Qyteti",
      type: "string",
      group: "basic",
      description: 'p.sh. "Shkodër", "Shëngjin"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "country",
      title: "Shteti",
      type: "string",
      group: "basic",
      initialValue: "Shqipëri",
    }),
    defineField({
      name: "year",
      title: "Viti",
      type: "number",
      group: "basic",
      validation: (r) => r.integer().min(2000).max(2100),
    }),
    defineField({
      name: "projectType",
      title: "Lloji",
      type: "string",
      group: "basic",
      options: { list: projectTypes, layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "systems",
      title: "Sistemet e përdorura",
      type: "array",
      group: "basic",
      of: [defineArrayMember({ type: "reference", to: [{ type: "system" }] })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "gallery",
      title: "Galeria (tërhiq disa foto njëherësh)",
      type: "array",
      group: "basic",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      options: { layout: "grid" },
      validation: noPlaceholderInGallery,
    }),
    defineField({
      name: "audience",
      title: "Për kë (faqet e zgjidhjeve)",
      type: "array",
      group: "more",
      of: [defineArrayMember({ type: "string" })],
      options: { list: audiences },
    }),
    defineField({ name: "client", title: "Klienti", type: "string", group: "more" }),
    defineField({ name: "areaM2", title: "Sipërfaqja (m²)", type: "number", group: "more" }),
    defineField({
      name: "summary",
      title: "Përmbledhje (1–2 fjali)",
      type: "internationalizedArrayText",
      group: "more",
    }),
    defineField({
      name: "story",
      title: "Sfida & zgjidhja",
      type: "internationalizedArrayBlockContent",
      group: "more",
    }),
    defineField({
      name: "beforeAfter",
      title: "Para / pas (faza 2)",
      type: "array",
      group: "more",
      hidden: true,
      of: [
        defineArrayMember({
          type: "object",
          name: "beforeAfterPair",
          fields: [
            defineField({ name: "before", title: "Para", type: "imageWithAlt" }),
            defineField({ name: "after", title: "Pas", type: "imageWithAlt" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Shfaqe në kryefaqe",
      type: "boolean",
      group: "more",
      initialValue: false,
    }),
    defineField({
      name: "featuredOrder",
      title: "Renditja në kryefaqe (1–5)",
      type: "number",
      group: "more",
      hidden: ({ parent }) => !parent?.featured,
      validation: (r) => r.integer().min(1).max(5),
    }),
    seoField,
  ],
  orderings: [
    { title: "Viti (më të rejat)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Kryefaqja", name: "featuredOrder", by: [{ field: "featuredOrder", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", city: "city", year: "year", media: "coverImage", featured: "featured" },
    prepare: ({ title, city, year, media, featured }) => ({
      title: firstValue(title as I18nItem<string>[]),
      subtitle: [city, year, featured ? "★ Kryefaqe" : null].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const solution = defineType({
  name: "solution",
  title: "Zgjidhje",
  type: "document",
  icon: icon("users"),
  groups: [{ name: "content", title: "Përmbajtja", default: true }, seoGroup],
  fields: [
    defineField({
      name: "segment",
      title: "Segmenti",
      type: "string",
      options: { list: audiences },
      validation: (r) => r.required(),
      group: "content",
    }),
    defineField({ ...titleField(), group: "content" }),
    defineField({ ...slugField, group: "content" }),
    defineField({
      name: "heroTitle",
      title: "Titulli i hero-s",
      type: "internationalizedArrayText",
      group: "content",
    }),
    defineField({ name: "heroImage", title: "Foto e hero-s", type: "imageWithAlt", group: "content" }),
    defineField({
      name: "cardText",
      title: "Teksti i kartës (1 rresht)",
      type: "internationalizedArrayString",
      group: "content",
    }),
    defineField({ name: "intro", title: "Hyrja", type: "internationalizedArrayText", group: "content" }),
    defineField({
      name: "benefits",
      title: "Çfarë ju ofrojmë (3–4)",
      type: "array",
      of: [defineArrayMember({ type: "benefit" })],
      validation: (r) => r.max(4),
      group: "content",
    }),
    defineField({
      name: "recommendedSystems",
      title: "Sistemet e rekomanduara",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "system" }] })],
      group: "content",
    }),
    defineField({
      name: "ctaKind",
      title: "Veprimi kryesor",
      type: "string",
      options: {
        list: [
          { title: "WhatsApp", value: "whatsapp" },
          { title: "Formulari i ofertës", value: "quote" },
          { title: "Formulari i tenderit", value: "tender" },
        ],
        layout: "radio",
      },
      group: "content",
    }),
    seoField,
  ],
  preview: {
    select: { title: "title", subtitle: "segment", media: "heroImage" },
    prepare: ({ title, subtitle, media }) => ({ title: firstValue(title), subtitle, media }),
  },
});

export const certificate = defineType({
  name: "certificate",
  title: "Certifikatë",
  type: "document",
  icon: icon("document-pdf"),
  fields: [
    titleField(),
    defineField({ name: "issuer", title: "Lëshuar nga", type: "string", description: "p.sh. ALUMIL" }),
    defineField({ name: "year", title: "Viti", type: "number" }),
    defineField({ name: "file", title: "PDF", type: "file", options: { accept: "application/pdf" } }),
    defineField({ name: "thumbnail", title: "Foto e vogël", type: "imageWithAlt" }),
  ],
  preview: {
    select: { title: "title", issuer: "issuer", media: "thumbnail" },
    prepare: ({ title, issuer, media }) => ({ title: firstValue(title), subtitle: issuer, media }),
  },
});

export const download = defineType({
  name: "download",
  title: "Shkarkim",
  type: "document",
  icon: icon("download"),
  fields: [
    titleField(),
    defineField({
      name: "file",
      title: "Skedari (PDF/ZIP)",
      type: "file",
      options: { accept: "application/pdf,application/zip" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "language",
      title: "Gjuha e dokumentit",
      type: "string",
      options: { list: ["sq", "en", "it", "de", "el"] },
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      options: {
        list: [
          { title: "Fletë teknike", value: "datasheet" },
          { title: "Katalog", value: "catalogue" },
          { title: "Certifikatë", value: "certificate" },
        ],
      },
    }),
    defineField({ name: "system", title: "Sistemi (opsional)", type: "reference", to: [{ type: "system" }] }),
  ],
  preview: {
    select: { title: "title", category: "category", language: "language" },
    prepare: ({ title, category, language }) => ({
      title: firstValue(title),
      subtitle: [category, language?.toUpperCase()].filter(Boolean).join(" · "),
    }),
  },
});

export const job = defineType({
  name: "job",
  title: "Pozicion pune",
  type: "document",
  icon: icon("case"),
  fields: [
    titleField(),
    slugField,
    defineField({
      name: "type",
      title: "Lloji",
      type: "string",
      options: {
        list: [
          { title: "Me kohë të plotë", value: "full-time" },
          { title: "Me kohë të pjesshme", value: "part-time" },
          { title: "Sezonal", value: "seasonal" },
        ],
      },
    }),
    defineField({ name: "location", title: "Vendndodhja", type: "string", initialValue: "Shkodër" }),
    defineField({ name: "description", title: "Përshkrimi", type: "internationalizedArrayBlockContent" }),
    defineField({ name: "active", title: "Aktiv", type: "boolean", initialValue: true }),
    defineField({ name: "publishedAt", title: "Publikuar më", type: "datetime" }),
  ],
  preview: {
    select: { title: "title", active: "active", location: "location" },
    prepare: ({ title, active, location }) => ({
      title: firstValue(title),
      subtitle: [location, active ? "Aktiv" : "Jo aktiv"].filter(Boolean).join(" · "),
    }),
  },
});

export const legalPage = defineType({
  name: "legalPage",
  title: "Faqe ligjore",
  type: "document",
  icon: icon("document"),
  fields: [
    titleField(),
    slugField,
    defineField({ name: "body", title: "Teksti", type: "internationalizedArrayBlockContent" }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: firstValue(title) }) },
});

export const singletonTypes = ["siteSettings", "homePage", "factoryPage", "pageSettings"] as const;

/**
 * "Rishiko" (08 §i18n): languages whose text is a machine translation still
 * waiting for review. Shown as a badge; editors untick a language once checked.
 */
const translationReview = defineField({
  name: "translationReview",
  title: "Rishiko përkthimin",
  description: "Gjuhët me përkthim automatik që duhen kontrolluar. Hiqeni gjuhën pasi ta keni rishikuar.",
  type: "array",
  of: [defineArrayMember({ type: "string" })],
  options: {
    list: [
      { title: "English", value: "en" },
      { title: "Italiano", value: "it" },
      { title: "Deutsch", value: "de" },
    ],
    layout: "grid",
  },
});

const withReview = <T extends { fields?: unknown[] }>(type: T): T => ({
  ...type,
  fields: [...(type.fields ?? []), translationReview],
});

export const documentTypes = [
  siteSettings,
  homePage,
  factoryPage,
  pageSettings,
  project,
  system,
  systemSeries,
  finish,
  solution,
  certificate,
  download,
  job,
  legalPage,
].map(withReview);
