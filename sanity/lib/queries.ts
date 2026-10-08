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
