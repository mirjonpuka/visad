import { defineQuery } from "next-sanity";

/*
 * GROQ queries (CMS §5). Localized fields use the internationalized-array v5
 * shape ({language, value}); every read falls back locale → en → sq
 * (Architecture §3), so a missing translation never renders empty.
 */

/** Localized value with fallback */
const L = (field: string) =>
  `coalesce(${field}[language == $locale][0].value, ${field}[language == "en"][0].value, ${field}[language == "sq"][0].value)`;

/** Localized slug with fallback + all slugs (for the language switcher) */
const SLUG = (field = "slug") =>
  `"slug": coalesce(${field}[language == $locale][0].value.current, ${field}[language == "en"][0].value.current, ${field}[language == "sq"][0].value.current),
   "slugs": ${field}[]{ language, "slug": value.current }`;

/** Image projection consumed by toSiteImage() → CMSImage */
const IMAGE = `{
  "assetId": asset._ref,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  crop,
  hotspot,
  "alt": ${L("alt")},
  isPlaceholder,
  placeholderNote
}`;

// ---------------------------------------------------------------------------
// Layout (navbar, menus, footer, WhatsApp) — every page
// ---------------------------------------------------------------------------

export const LAYOUT_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    companyName,
    "address": ${L("address")},
    geo,
    phones[]{ label, number },
    whatsappNumber,
    "whatsappMessage": ${L("whatsappMessage")},
    email,
    openingHours[]{ "days": ${L("days")}, hours },
    social[]{ platform, url },
    "alumilText": ${L("alumilPartner.text")},
    "alumilLogo": alumilPartner.logo${IMAGE}
  },
  "systems": *[_type == "system" && defined(slug)] | order(order asc){
    _id,
    order,
    "title": ${L("title")},
    ${SLUG()},
    "text": ${L("shortDescription")},
    "thumbnail": thumbnail${IMAGE}
  },
  "solutions": *[_type == "solution" && defined(slug)]
    | order(select(segment == "homeowners" => 1, segment == "developers" => 2, segment == "hotels" => 3, 4) asc){
    _id,
    segment,
    "title": ${L("title")},
    ${SLUG()},
    "text": ${L("cardText")},
    "image": heroImage${IMAGE}
  }
}`);

// ---------------------------------------------------------------------------
// Home (UI §3)
// ---------------------------------------------------------------------------

export const HOME_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    stats[]{ value, "label": ${L("label")} },
    whatsappNumber
  },
  "home": *[_id == "homePage"][0]{
    "heroImage": heroImage${IMAGE},
    "heroVideo": heroVideo.asset->url,
    "heroEyebrow": ${L("heroEyebrow")},
    "heroTitle": ${L("heroTitle")},
    "heroLead": ${L("heroLead")},
    heroCtas[]{ "label": ${L("label")}, href, kind },
    "profileStoryTitle": ${L("profileStoryTitle")},
    profileStorySteps[]{ "title": ${L("title")}, "text": ${L("text")} },
    "systemsTitle": ${L("systemsTitle")},
    "featuredProjectsTitle": ${L("featuredProjectsTitle")},
    "featuredProjectsIntro": ${L("featuredProjectsIntro")},
    "factoryTitle": ${L("factoryTitle")},
    "factoryText": ${L("factoryText")},
    factorySteps[]{ "title": ${L("title")}, "text": ${L("text")} },
    "factoryImages": factoryImages[]${IMAGE},
    "solutionsTitle": ${L("solutionsTitle")},
    "ctaTitle": ${L("ctaTitle")},
    "ctaText": ${L("ctaText")}
  },
  "systems": *[_type == "system" && defined(slug)] | order(order asc){
    _id,
    "title": ${L("title")},
    ${SLUG()},
    "text": ${L("shortDescription")},
    "image": accordionImage${IMAGE},
    "hasDatasheet": count(downloads[@->category == "datasheet"]) > 0
  },
  "featured": *[_type == "project" && featured == true && defined(slug)] | order(featuredOrder asc)[0...5]{
    _id,
    "title": ${L("title")},
    ${SLUG()},
    city,
    year,
    "coverImage": coverImage${IMAGE},
    "systems": systems[]->{ "title": ${L("title")} }.title
  }
}`);

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

/** Lightweight list for client-side filtering (UI §6, Architecture §4) */
export const PROJECTS_QUERY =
  defineQuery(`*[_type == "project" && defined(slug)] | order(year desc, _createdAt desc){
  _id,
  "title": ${L("title")},
  ${SLUG()},
  city,
  year,
  projectType,
  "systemSlugs": systems[]->slug[language == "sq"][0].value.current,
  "coverImage": coverImage${IMAGE}
}`);

export const PROJECT_SLUGS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug)]{ "slugs": slug[]{ language, "slug": value.current } }`,
);

export const PROJECT_QUERY = defineQuery(`*[_type == "project" && $slug in slug[].value.current][0]{
  _id,
  "title": ${L("title")},
  ${SLUG()},
  city,
  country,
  year,
  projectType,
  client,
  areaM2,
  "summary": ${L("summary")},
  "story": ${L("story")},
  "coverImage": coverImage${IMAGE},
  "gallery": gallery[]${IMAGE},
  "systems": systems[]->{ _id, "title": ${L("title")}, ${SLUG()}, "thumbnail": thumbnail${IMAGE} },
  "next": *[_type == "project" && _id != ^._id && year <= ^.year] | order(year desc)[0]{
    "title": ${L("title")}, ${SLUG()}, "coverImage": coverImage${IMAGE}
  },
  "seo": { "title": ${L("seo.title")}, "description": ${L("seo.description")} }
}`);

// ---------------------------------------------------------------------------
// Shared projections (Phase 7)
// ---------------------------------------------------------------------------

/** Project tile: title, link, meta, cover */
const PROJECT_CARD = `{
  _id,
  "title": ${L("title")},
  ${SLUG()},
  city,
  year,
  projectType,
  "coverImage": coverImage${IMAGE},
  "systems": systems[]->{ "title": ${L("title")} }.title
}`;

/** System card: title, link, one line, thumbnail (16:10) */
const SYSTEM_CARD = `{
  _id,
  "title": ${L("title")},
  ${SLUG()},
  "text": ${L("shortDescription")},
  "image": thumbnail${IMAGE}
}`;

/** Download row: only documents with a file */
const DOWNLOAD = `{
  _id,
  "title": ${L("title")},
  "url": file.asset->url,
  "size": file.asset->size,
  "extension": file.asset->extension,
  language,
  category
}`;

const SEO = `"seo": { "title": ${L("seo.title")}, "description": ${L("seo.description")}, "noIndex": seo.noIndex, "image": seo.ogImage${IMAGE} }`;

const BENEFIT = `{ icon, "title": ${L("title")}, "text": ${L("text")} }`;
const SPEC = `{ "label": ${L("label")}, value, unit }`;

/** All localized slugs of a type, for generateStaticParams */
export const SLUGS_BY_TYPE_QUERY = defineQuery(
  `*[_type == $type && defined(slug)]{ "slugs": slug[]{ language, "slug": value.current } }`,
);

// ---------------------------------------------------------------------------
// Systems (UI §4, §5)
// ---------------------------------------------------------------------------

export const SYSTEMS_INDEX_QUERY = defineQuery(`{
  "page": *[_id == "pageSettings"][0]{
    "hero": systemsHero${IMAGE},
    "title": ${L("systemsTitle")},
    "intro": ${L("systemsIntro")},
    "keySpecs": systemsKeySpecs[]${SPEC}
  },
  "systems": *[_type == "system" && defined(slug)] | order(order asc){
    _id,
    "title": ${L("title")},
    ${SLUG()},
    "text": ${L("shortDescription")},
    "image": thumbnail${IMAGE},
    "features": benefits[0...3]{ "title": ${L("title")} }.title
  },
  "downloads": *[_type == "download" && defined(file.asset)] | order(category asc, _createdAt asc)${DOWNLOAD}
}`);

export const SYSTEM_QUERY = defineQuery(`*[_type == "system" && $slug in slug[].value.current][0]{
  _id,
  "title": ${L("title")},
  ${SLUG()},
  "text": ${L("shortDescription")},
  "heroImage": heroImage${IMAGE},
  "overview": ${L("overview")},
  "benefits": benefits[]${BENEFIT},
  "series": series[]->{
    _id,
    title,
    "image": image${IMAGE},
    "specs": specs[0...3]${SPEC},
    "datasheet": datasheet->file.asset->url,
    "description": ${L("description")}
  },
  "specs": specs[]${SPEC},
  "crossSection": crossSection${IMAGE},
  "finishes": finishes[]->{ _id, "name": ${L("name")}, code, type, "swatch": swatch.hex, "image": image${IMAGE} },
  "downloads": downloads[]->${DOWNLOAD},
  "faqs": faqs[]{ "question": ${L("question")}, "answer": ${L("answer")} },
  "projects": *[_type == "project" && references(^._id) && defined(slug)] | order(year desc, _createdAt desc)[0...3]${PROJECT_CARD},
  ${SEO}
}`);

// ---------------------------------------------------------------------------
// Projects (UI §6, §7)
// ---------------------------------------------------------------------------

export const PROJECTS_PAGE_QUERY = defineQuery(`{
  "intro": *[_id == "pageSettings"][0]{ "v": ${L("projectsIntro")} }.v,
  "projects": *[_type == "project" && defined(slug)] | order(year desc, _createdAt desc){
    _id,
    "title": ${L("title")},
    ${SLUG()},
    city,
    year,
    projectType,
    "coverImage": coverImage${IMAGE},
    "systems": systems[]->{ "key": slug[language == "sq"][0].value.current, "title": ${L("title")} }
  },
  "systems": *[_type == "system" && defined(slug)] | order(order asc){
    "key": slug[language == "sq"][0].value.current,
    "title": ${L("title")}
  }
}`);

export const PROJECT_PAGE_QUERY = defineQuery(`{
  "project": *[_type == "project" && $slug in slug[].value.current][0]{
    _id,
    "title": ${L("title")},
    ${SLUG()},
    city,
    country,
    year,
    projectType,
    client,
    areaM2,
    "summary": ${L("summary")},
    "story": ${L("story")},
    "coverImage": coverImage${IMAGE},
    "gallery": gallery[]${IMAGE},
    "systems": systems[]->${SYSTEM_CARD},
    ${SEO}
  },
  "order": *[_type == "project" && defined(slug)] | order(year desc, _createdAt desc){
    _id,
    "title": ${L("title")},
    ${SLUG()},
    "coverImage": coverImage${IMAGE}
  }
}`);

// ---------------------------------------------------------------------------
// Factory (UI §8)
// ---------------------------------------------------------------------------

export const FACTORY_QUERY = defineQuery(`{
  "factory": *[_id == "factoryPage"][0]{
    "heroImage": heroImage${IMAGE},
    "heroVideo": heroVideo.asset->url,
    "title": ${L("title")},
    "intro": ${L("intro")},
    stats[]{ value, "label": ${L("label")} },
    processSteps[]{ "title": ${L("title")}, "text": ${L("text")}, "image": image${IMAGE} },
    machinery[]{ "image": image${IMAGE}, "caption": ${L("caption")} },
    "certificates": certificates[]->{
      _id, "title": ${L("title")}, issuer, year, "url": file.asset->url, "thumbnail": thumbnail${IMAGE}
    },
    team[]{ name, "role": ${L("role")}, "photo": photo${IMAGE} },
    ${SEO}
  },
  "home": *[_id == "homePage"][0]{ "factoryText": ${L("factoryText")} },
  "settings": *[_id == "siteSettings"][0]{
    stats[]{ value, "label": ${L("label")} },
    "alumilCertificate": alumilPartner.certificate.asset->url
  }
}`);

// ---------------------------------------------------------------------------
// Solutions (UI §9)
// ---------------------------------------------------------------------------

export const SOLUTION_QUERY = defineQuery(`*[_type == "solution" && $slug in slug[].value.current][0]{
  _id,
  segment,
  "title": ${L("title")},
  ${SLUG()},
  "heroTitle": ${L("heroTitle")},
  "heroImage": heroImage${IMAGE},
  "intro": coalesce(${L("intro")}, ${L("cardText")}),
  "benefits": benefits[]${BENEFIT},
  "systems": recommendedSystems[]->${SYSTEM_CARD},
  ctaKind,
  "projects": *[_type == "project" && ^.segment in audience && defined(slug)] | order(year desc, _createdAt desc)[0...3]${PROJECT_CARD},
  "downloads": select(segment == "architects" => *[_type == "download" && defined(file.asset)] | order(category asc)${DOWNLOAD}, []),
  ${SEO}
}`);

// ---------------------------------------------------------------------------
// Careers (UI §10) and legal (UI §12)
// ---------------------------------------------------------------------------

export const CAREERS_QUERY = defineQuery(`{
  "page": *[_id == "pageSettings"][0]{
    "hero": careersHero${IMAGE},
    "intro": ${L("careersIntro")},
    "benefits": careersBenefits[]${BENEFIT}
  },
  "jobs": *[_type == "job" && active != false && defined(slug)] | order(publishedAt desc, _createdAt desc){
    _id,
    "title": ${L("title")},
    ${SLUG()},
    type,
    location
  }
}`);

export const JOB_QUERY = defineQuery(`*[_type == "job" && active != false && $slug in slug[].value.current][0]{
  _id,
  "title": ${L("title")},
  ${SLUG()},
  type,
  location,
  publishedAt,
  "description": ${L("description")}
}`);

export const LEGAL_QUERY = defineQuery(`*[_id == $id][0]{
  "title": ${L("title")},
  ${SLUG()},
  "body": ${L("body")},
  _updatedAt
}`);

/** Closing CTA copy, shared by all pages (edited once on the Home page) */
export const CTA_QUERY = defineQuery(`*[_id == "homePage"][0]{
  "title": ${L("ctaTitle")},
  "text": ${L("ctaText")}
}`);
