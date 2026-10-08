import type { DocumentBadgeComponent } from "sanity";
import { leadStatuses } from "./schemaTypes/leads";

type I18nItem = { language?: string; value?: unknown };

const OPTIONAL_LANGUAGES = ["en", "it", "de"];

/** Fields checked for missing translations, per document type */
const TRANSLATED_FIELDS: Record<string, string[]> = {
  project: ["title"],
  system: ["title", "shortDescription"],
  solution: ["title"],
  job: ["title"],
  legalPage: ["title"],
  certificate: ["title"],
  download: ["title"],
  finish: ["name"],
  homePage: ["heroTitle"],
  factoryPage: ["title"],
};

/** "Mungon EN/IT/DE" when a document has no translation for some languages (CMS §1). */
export const MissingTranslationsBadge: DocumentBadgeComponent = ({ draft, published, type }) => {
  const doc = (draft ?? published) as Record<string, unknown> | null;
  const fields = TRANSLATED_FIELDS[type];
  if (!doc || !fields) return null;

  const missing = OPTIONAL_LANGUAGES.filter((language) =>
    fields.some((field) => {
      const items = doc[field] as I18nItem[] | undefined;
      return !items?.some((item) => item.language === language && item.value);
    }),
  );
  if (!missing.length) return null;
  return {
    label: `Mungon ${missing.map((l) => l.toUpperCase()).join("/")}`,
    title: "Mungojnë përkthimet. Faqja do të shfaqë anglisht ose shqip në vend të tyre.",
    color: "warning",
  };
};

const STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "danger"> = {
  new: "primary",
  contacted: "warning",
  "offer-sent": "warning",
  won: "success",
  lost: "danger",
};

/** Lead status as a coloured badge in the "Kërkesat" workspace. */
export const LeadStatusBadge: DocumentBadgeComponent = ({ draft, published }) => {
  const status = ((draft ?? published) as { status?: string } | null)?.status ?? "new";
  return {
    label: leadStatuses.find((s) => s.value === status)?.title ?? status,
    color: STATUS_COLORS[status] ?? "primary",
  };
};
