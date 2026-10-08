import type { Rule, SanityDocument, SlugSourceContext } from "sanity";

export type I18nItem<T = unknown> = { _key: string; language?: string; value?: T };

function hasValue(value: unknown) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object" && "current" in value)
    return Boolean((value as { current?: string }).current);
  return true;
}

/** Only Albanian is required to publish (CMS §1). */
export function requireSq(rule: Rule) {
  return rule.custom((items: I18nItem[] | undefined) =>
    items?.some((item) => item.language === "sq" && hasValue(item.value))
      ? true
      : "Teksti në shqip (SQ) është i detyrueshëm.",
  );
}

/** Max length per language (SEO title ≤ 60, description ≤ 155). */
export function maxPerLanguage(max: number) {
  return (rule: Rule) =>
    rule.custom((items: I18nItem<string>[] | undefined) => {
      const tooLong = (items ?? []).filter((item) => (item.value ?? "").length > max);
      return tooLong.length
        ? tooLong.map((item) => ({
            message: `Maksimumi ${max} karaktere (${item.language?.toUpperCase()}).`,
            path: [{ _key: item._key }, "value"],
          }))
        : true;
    });
}

/** "Çelësi" (slug) per language, generated from the title in the same language. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // strip combining marks: ë → e, ç → c
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function titleInSameLanguage(doc: SanityDocument, context: SlugSourceContext) {
  const language = (context.parent as I18nItem | undefined)?.language;
  const title = doc.title as I18nItem<string>[] | undefined;
  return title?.find((item) => item.language === language)?.value ?? "";
}

/** First non-empty value of a localized field, for previews. */
export function firstValue(items: I18nItem<string>[] | undefined, language = "sq") {
  return items?.find((item) => item.language === language)?.value ?? items?.find((item) => item.value)?.value;
}
