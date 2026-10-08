import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing, type Locale } from "./routing";

type Messages = Record<string, unknown>;

function merge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const prev = out[key];
    out[key] =
      prev && typeof prev === "object" && value && typeof value === "object"
        ? merge(prev as Messages, value as Messages)
        : value;
  }
  return out;
}

async function load(locale: Locale): Promise<Messages> {
  return (await import(`../messages/${locale}.json`)).default;
}

export default getRequestConfig(async ({ locale: override }) => {
  const candidate = override ?? (await rootLocale());
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  // Fallback order for missing strings: locale → en → sq (Architecture §3)
  let messages = await load("sq");
  if (locale !== "sq") messages = merge(messages, await load("en"));
  if (locale !== "sq" && locale !== "en") messages = merge(messages, await load(locale));

  return { locale, messages };
});
