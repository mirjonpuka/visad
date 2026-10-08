/**
 * Lists every English value of localized CMS fields that has no Italian or
 * German value yet (input for scripts/i18n-content.json).
 * Usage: npx tsx --env-file=.env.local scripts/i18n-collect.mts
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

type Item = { _type?: string; language?: string; value?: unknown };
const found = new Map<string, string>(); // text → kind

function blocksText(value: unknown) {
  return (value as { children?: { text?: string }[] }[]).map((b) => (b.children ?? []).map((c) => c.text).join("")).join("\n\n");
}

function walk(node: unknown) {
  if (Array.isArray(node)) {
    const items = node as Item[];
    if (items.length && items.every((i) => i && typeof i === "object" && "language" in i)) {
      const en = items.find((i) => i.language === "en");
      const has = (l: string) => items.some((i) => i.language === l && i.value);
      if (en?.value && (!has("it") || !has("de"))) {
        const kind = en._type ?? "";
        if (kind.includes("Slug")) return;
        const text = kind.includes("BlockContent") ? blocksText(en.value) : String(en.value);
        found.set(text, kind);
      }
      return;
    }
    node.forEach(walk);
  } else if (node && typeof node === "object") {
    Object.values(node).forEach(walk);
  }
}

const docs = await client.fetch(`*[!(_id in path("drafts.**")) && !(_type match "sanity.*") && !(_type match "system.*")]`);
docs.forEach(walk);
console.log(JSON.stringify(Object.fromEntries([...found].map(([text]) => [text, { it: "", de: "" }])), null, 2));
console.error(`${found.size} strings`);
