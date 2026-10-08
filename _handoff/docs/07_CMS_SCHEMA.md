# 07 — CMS Schema (Sanity) = the "database"

There is no separate SQL database. **Sanity** stores all content (dataset `production`) and all form submissions (private dataset `leads`). Uploaded customer files live in Vercel Blob; their URLs are stored on the lead documents.

## 1. Localization pattern
Use `sanity-plugin-internationalized-array` with languages `sq` (required), `en`, `it`, `de`:
- `internationalizedArrayString` (short text), `internationalizedArrayText` (plain paragraphs), `internationalizedArrayBlockContent` (rich text), `internationalizedArraySlug` (custom: one slug per language, generated from the title in that language).
- Query helper in GROQ: `coalesce(title[_key == $locale][0].value, title[_key == "en"][0].value, title[_key == "sq"][0].value)`.
- Only Albanian is required for publishing; missing languages fall back (see Architecture §3). The Studio shows a small "Mungon EN/IT/DE" badge on documents with missing translations.

## 2. Shared object types
```ts
// imageWithAlt — used for EVERY image field
{ name: 'imageWithAlt', type: 'image', options: { hotspot: true, metadata: ['lqip','palette','dimensions'] },
  fields: [
    { name: 'alt', type: 'internationalizedArrayString', title: 'Përshkrim (alt)', validation: r => r.required() },
    { name: 'isPlaceholder', type: 'boolean', title: 'Foto e përkohshme?', initialValue: false,
      description: 'Shëno nëse kjo është foto stock/AI e përkohshme. Nuk lejohet te projektet.' },
    { name: 'placeholderNote', type: 'string', title: 'Çfarë foto duhet këtu', description: 'Shfaqet poshtë në mes kur mungon foto' },
    { name: 'credit', type: 'string', title: 'Autori / licenca' },
  ] }

// seo
{ name: 'seo', type: 'object', fields: [
  { name: 'title', type: 'internationalizedArrayString', validation: r => r.max(60) },
  { name: 'description', type: 'internationalizedArrayText', validation: r => r.max(155) },
  { name: 'ogImage', type: 'imageWithAlt' },
  { name: 'noIndex', type: 'boolean' } ] }

// stat: { value: string ('9500+'), label: internationalizedArrayString }
// spec: { label: internationalizedArrayString, value: string, unit?: string }   e.g. "Uw" "1.1" "W/m²K"
// benefit: { icon: string (lucide name), title: i18nString, text: i18nText }
// faqItem: { question: i18nString, answer: i18nBlock }
// cta: { label: i18nString, href: string, kind: 'primary'|'secondary'|'whatsapp' }
```

## 3. Document types (dataset `production`)

### `siteSettings` (singleton)
| Field | Type | Notes |
|---|---|---|
| companyName | string | "VISAD Construction" |
| address | i18nText | Rr. Shkodër–Koplik, km 10, Shkodër 4301 |
| geo | geopoint | for map + JSON-LD |
| phones | array of { label, number } | +355 67 377 2989, +355 67 255 9898 |
| whatsappNumber | string | 355673772989 |
| whatsappMessage | i18nString | prefilled text |
| email | string | info@visad.al |
| leadEmail | string | where form notifications go |
| openingHours | array { days: i18nString, hours: string } | |
| social | array { platform: enum, url } | |
| stats | array of `stat` (3–4) | must be confirmed by client |
| alumilPartner | { logo: imageWithAlt, certificate: file, text: i18nText } | |
| defaultSeo | seo | |

### `homePage` (singleton)
heroImage (imageWithAlt) · heroVideo (file, optional) · heroEyebrow · heroTitle (i18nText, line breaks allowed) · heroLead · heroCtas (cta[2]) · profileStorySteps (array of 5 { title, text }) · systemsTitle · featuredProjectsTitle/Intro · factoryTitle/Text/steps(3)/images(3) · solutionsTitle · ctaTitle/Text · seo.

### `system` (6 documents)
| Field | Type | Notes |
|---|---|---|
| title | i18nString | "Dritare" |
| slug | i18nSlug | per language |
| order | number | accordion/menu order |
| shortDescription | i18nText | 1–2 sentences (accordion, mega-menu) |
| heroImage, accordionImage, thumbnail | imageWithAlt | |
| overview | i18nBlock | |
| benefits | array of benefit (≤4) | |
| series | array of reference → `systemSeries` | |
| specs | array of spec | general specs table |
| crossSection | imageWithAlt | technical drawing |
| finishes | array of reference → `finish` | |
| downloads | array of reference → `download` | |
| faqs | array of faqItem | |
| seo | seo | |

### `systemSeries`
title (string, e.g. ALUMIL series name) · system (ref → system) · image · specs (spec[]) · datasheet (ref → download) · description (i18nText).

### `finish`
name (i18nString) · code (string, e.g. "RAL 7016") · type (enum: RAL, anodised, wood-effect, texture) · swatch (color hex, `@sanity/color-input`) or image.

### `project` ⭐ (the type the client edits most — keep it simple)
| Field | Type | Required | Notes |
|---|---|---|---|
| title | i18nString | ✔ (sq) | "Fishta Hotel" |
| slug | i18nSlug | ✔ | auto from title |
| coverImage | imageWithAlt | ✔ | `isPlaceholder` must be false (validation) |
| gallery | array of imageWithAlt | | drag & drop multi-upload; validation: no placeholders |
| city | string | ✔ | "Shkodër", "Shëngjin" … (used by the filter) |
| country | string | | default "Shqipëri" |
| year | number | | |
| projectType | enum: `residential` (Banim), `villa` (Vila), `hotel`, `commercial`, `public` | ✔ | filter "Lloji" |
| audience | array enum: homeowners/developers/hotels/architects | | used on Solution pages |
| systems | array ref → system | ✔ | filter "Sistemi" |
| client | string | | |
| areaM2 | number | | |
| summary | i18nText | | 1–2 sentences (tile/OG) |
| story | i18nBlock | | "Sfida & zgjidhja" |
| beforeAfter | array of { before: imageWithAlt, after: imageWithAlt } | | phase 2 |
| featured | boolean | | show on Home |
| featuredOrder | number | | 1–5 |
| seo | seo | | |

Studio UX for `project`: field groups "Bazë" (title, cover, city, year, type, systems) and "Më shumë" (rest). Preview shows cover + city + year. Initial template "Projekt i ri" with country = Shqipëri.

### `solution` (4 documents)
segment (enum: homeowners, developers, hotels, architects) · title · slug · heroImage · intro · benefits · recommendedSystems (ref[]) · ctaKind (enum: whatsapp, quote, tender) · seo.

### `factoryPage` (singleton)
heroImage/heroVideo · title · intro · stats · processSteps (array { title, text, image }) · machinery (array imageWithAlt + caption) · certificates (ref → certificate) · team (array { name, role, photo }) · seo.

### `certificate`
title (i18nString) · issuer (string, e.g. ALUMIL) · year · file (PDF) · thumbnail (imageWithAlt).

### `download`
title (i18nString) · file (file: pdf/zip) · language (enum) · category (enum: datasheet, catalogue, certificate) · system (ref, optional).

### `job`
title · slug · type (enum: full-time, part-time, seasonal) · location · description (i18nBlock) · active (boolean) · publishedAt.

### `legalPage`
title · slug · body (i18nBlock).

## 4. Lead types (private dataset `leads`, written only by the server)
```ts
quoteRequest  { createdAt, locale, systems: string[], projectType, openings: number, dimensions, city,
                name, phone, email, preferredContact: 'whatsapp'|'phone'|'email',
                photos: { url, name, size }[], message, consent: boolean, sourcePage, status: 'new'|'contacted'|'offer-sent'|'won'|'lost', notes }
tenderRequest { createdAt, locale, company, contactPerson, role, phone, email, projectName, location,
                stage: 'design'|'tender'|'construction', areaM2, deadline, documents: { url, name, size }[],
                message, consent, status, notes }
jobApplication { createdAt, locale, job (title + slug snapshot), name, phone, email, cv: { url, name }, message, consent, status }
```
The Studio has a second workspace "Kërkesat" (leads dataset) where the client sees incoming requests as a list sorted by date with status badges, so nothing is lost if an email is missed.

## 5. Key GROQ queries
```groq
// Home
{
  "settings": *[_type=="siteSettings"][0]{ stats[]{ value, "label": coalesce(label[_key==$locale][0].value, label[_key=="sq"][0].value) }, whatsappNumber },
  "home": *[_type=="homePage"][0]{ ..., heroImage{..., asset->{ _id, metadata{ lqip, dimensions } } } },
  "systems": *[_type=="system"] | order(order asc){ _id, order, "title": coalesce(title[_key==$locale][0].value, title[_key=="sq"][0].value),
      "slug": coalesce(slug[_key==$locale][0].value.current, slug[_key=="sq"][0].value.current),
      "text": coalesce(shortDescription[_key==$locale][0].value, shortDescription[_key=="sq"][0].value), accordionImage },
  "featured": *[_type=="project" && featured==true] | order(featuredOrder asc)[0...5]{ _id, "title": ..., "slug": ..., city, year, coverImage, "systems": systems[]->title }
}

// Projects index (lightweight list for client-side filtering)
*[_type=="project"] | order(year desc, _createdAt desc){ _id, "title": ..., "slug": ..., city, year, projectType, "systemSlugs": systems[]->slug[_key=="sq"][0].value.current, coverImage }

// Project detail
*[_type=="project" && $slug in slug[].value.current][0]{ ..., systems[]->{ title, slug, thumbnail }, gallery[]{ ..., asset->{ metadata{ lqip, dimensions } } },
  "next": *[_type=="project" && year <= ^.year && _id != ^._id] | order(year desc)[0]{ title, slug, coverImage } }
```

## 6. Seed data (to create on first setup, `scripts/seed-sanity.ts`)
- `siteSettings` with the real contact data above and stats 9500+ / 16+ / 5 (flag "to confirm").
- 6 `system` documents with the AL texts from `08_CONTENT.md`.
- 4 `solution` documents.
- 7 `project` drafts from the real photos in `images/web/` (see `09_ASSETS.md`), with title/city/year as `[TO CONFIRM]` except "Fishta Hotel" (name visible on the building).
- Upload all `images/web/*.webp` as Sanity assets with alt texts from `images/manifest.json`.
