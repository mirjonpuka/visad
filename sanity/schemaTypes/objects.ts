import { defineArrayMember, defineField, defineType } from "sanity";
import { firstValue, maxPerLanguage, requireSq } from "./helpers";

/** Rich text used by internationalizedArrayBlockContent */
export const blockContent = defineType({
  name: "blockContent",
  title: "Tekst i pasur",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraf", value: "normal" },
        { title: "Titull H2", value: "h2" },
        { title: "Titull H3", value: "h3" },
      ],
      lists: [
        { title: "Pika", value: "bullet" },
        { title: "Numra", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Theksuar", value: "strong" },
          { title: "Pjerrët", value: "em" },
        ],
        annotations: [
          defineField({
            name: "link",
            title: "Lidhje",
            type: "object",
            fields: [defineField({ name: "href", title: "URL", type: "url" })],
          }),
        ],
      },
    }),
  ],
});

/** Every image field (CMS §2) */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Foto",
  type: "image",
  options: { hotspot: true, metadata: ["lqip", "palette"] },
  fields: [
    defineField({
      name: "alt",
      title: "Përshkrim (alt)",
      type: "internationalizedArrayString",
      description: "Çfarë tregon fotoja, për lexuesit e ekranit dhe Google.",
      validation: requireSq,
    }),
    defineField({
      name: "isPlaceholder",
      title: "Foto e përkohshme?",
      type: "boolean",
      initialValue: false,
      description: "Shëno nëse kjo është foto stock/AI e përkohshme. Nuk lejohet te projektet.",
    }),
    defineField({
      name: "placeholderNote",
      title: "Çfarë foto duhet këtu",
      type: "string",
      description: "Shfaqet poshtë në mes të fotos së përkohshme.",
      hidden: ({ parent }) => !parent?.isPlaceholder,
    }),
    defineField({ name: "credit", title: "Autori / licenca", type: "string" }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Titulli (≤ 60)",
      type: "internationalizedArrayString",
      validation: maxPerLanguage(60),
    }),
    defineField({
      name: "description",
      title: "Përshkrimi (≤ 155)",
      type: "internationalizedArrayText",
      validation: maxPerLanguage(155),
    }),
    defineField({ name: "ogImage", title: "Foto për rrjetet sociale", type: "imageWithAlt" }),
    defineField({ name: "noIndex", title: "Fshih nga Google", type: "boolean", initialValue: false }),
  ],
});

export const stat = defineType({
  name: "stat",
  title: "Numër",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Vlera", type: "string", description: 'p.sh. "9500+"' }),
    defineField({
      name: "label",
      title: "Etiketa",
      type: "internationalizedArrayString",
      validation: requireSq,
    }),
  ],
  preview: {
    select: { value: "value", label: "label" },
    prepare: ({ value, label }) => ({ title: value, subtitle: firstValue(label) }),
  },
});

export const spec = defineType({
  name: "spec",
  title: "Specifikë",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Vetia",
      type: "internationalizedArrayString",
      validation: requireSq,
    }),
    defineField({ name: "value", title: "Vlera", type: "string" }),
    defineField({ name: "unit", title: "Njësia", type: "string", description: 'p.sh. "W/m²K"' }),
  ],
  preview: {
    select: { label: "label", value: "value", unit: "unit" },
    prepare: ({ label, value, unit }) => ({
      title: firstValue(label),
      subtitle: [value, unit].filter(Boolean).join(" "),
    }),
  },
});

export const benefit = defineType({
  name: "benefit",
  title: "Avantazh",
  type: "object",
  fields: [
    defineField({
      name: "icon",
      title: "Ikona (emri lucide)",
      type: "string",
      description: "p.sh. thermometer, shield, volume-x",
    }),
    defineField({
      name: "title",
      title: "Titulli",
      type: "internationalizedArrayString",
      validation: requireSq,
    }),
    defineField({ name: "text", title: "Teksti", type: "internationalizedArrayText" }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: firstValue(title) }) },
});

export const faqItem = defineType({
  name: "faqItem",
  title: "Pyetje",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Pyetja",
      type: "internationalizedArrayString",
      validation: requireSq,
    }),
    defineField({ name: "answer", title: "Përgjigja", type: "internationalizedArrayBlockContent" }),
  ],
  preview: { select: { title: "question" }, prepare: ({ title }) => ({ title: firstValue(title) }) },
});

export const cta = defineType({
  name: "cta",
  title: "Buton",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Teksti",
      type: "internationalizedArrayString",
      validation: requireSq,
    }),
    defineField({
      name: "href",
      title: "Lidhja",
      type: "string",
      description: 'p.sh. "/kontakt" ose "/projektet"',
    }),
    defineField({
      name: "kind",
      title: "Lloji",
      type: "string",
      options: { list: ["primary", "secondary", "whatsapp"], layout: "radio" },
      initialValue: "primary",
    }),
  ],
  preview: {
    select: { label: "label", href: "href" },
    prepare: ({ label, href }) => ({ title: firstValue(label), subtitle: href }),
  },
});

/** A simple { title, text } step (profile story, factory teaser) */
export const step = defineType({
  name: "step",
  title: "Hap",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titulli",
      type: "internationalizedArrayString",
      validation: requireSq,
    }),
    defineField({ name: "text", title: "Teksti", type: "internationalizedArrayText" }),
    defineField({ name: "image", title: "Foto (opsionale)", type: "imageWithAlt" }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({ title: firstValue(title), media }),
  },
});

export const objectTypes = [blockContent, imageWithAlt, seo, stat, spec, benefit, faqItem, cta, step];
