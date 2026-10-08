/**
 * Phase 9: adds Italian and German values to every localized CMS field that
 * has English but no IT/DE yet (translations in scripts/i18n-content.json),
 * plus IT/DE slugs, and marks the documents "Rishiko IT/DE".
 * Existing IT/DE values are never overwritten. Safe to re-run.
 *
 * Usage: npx tsx --env-file=.env.local scripts/migrations/002-translate-it-de.mts [--dry]
 */
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

const DRY = process.argv.includes("--dry");
const LANGS = ["it", "de"] as const;
const data = JSON.parse(readFileSync(new URL("../i18n-content.json", import.meta.url), "utf8")) as {
  strings: Record<string, Record<(typeof LANGS)[number], string>>;
  slugs: Record<string, Record<(typeof LANGS)[number], string>>;
};

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

type Item = { _key: string; _type: string; language: string; value: unknown };
const missing = new Set<string>();

function translateBlocks(blocks: { _key: string; children?: { _key: string; text?: string }[] }[], lang: string) {
  return blocks.map((block, i) => ({
    ...block,
    _key: `${lang}${i}`,
    children: (block.children ?? []).map((child, j) => {
      const text = child.text ?? "";
      const out = data.strings[text]?.[lang as "it"];
      if (!out && text.trim()) missing.add(text);
      return { ...child, _key: `${lang}${i}s${j}`, text: out ?? text };
    }),
  }));
}

/** Returns a translated copy of `node` and whether anything was added. */
function walk(node: unknown, docId: string): [unknown, boolean] {
  if (Array.isArray(node)) {
    const items = node as Item[];
    const isI18n = items.length > 0 && items.every((i) => i && typeof i === "object" && "language" in i && "_type" in i);
    if (isI18n) {
      const en = items.find((i) => i.language === "en");
      if (!en?.value) return [node, false];
      const added: Item[] = [];
      for (const lang of LANGS) {
        if (items.some((i) => i.language === lang && i.value)) continue;
        let value: unknown;
        if (en._type.includes("Slug")) {
          const slug = data.slugs[docId]?.[lang];
          if (!slug) {
            missing.add(`slug ${docId} ${lang}`);
            continue;
          }
          value = { _type: "slug", current: slug };
        } else if (en._type.includes("BlockContent")) {
          value = translateBlocks(en.value as never, lang);
        } else {
          const out = data.strings[String(en.value)]?.[lang];
          if (!out) {
            missing.add(String(en.value));
            continue;
          }
          value = out;
        }
        added.push({ _key: lang, _type: en._type, language: lang, value });
      }
      return added.length ? [[...items.filter((i) => !added.some((a) => a.language === i.language)), ...added], true] : [node, false];
    }
    let changed = false;
    const out = node.map((child) => {
      const [next, c] = walk(child, docId);
      changed ||= c;
      return next;
    });
    return [out, changed];
  }
  if (node && typeof node === "object") {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      const [next, c] = walk(value, docId);
      changed ||= c;
      out[key] = next;
    }
    return [out, changed];
  }
  return [node, false];
}

const docs = await client.fetch<Record<string, unknown>[]>(
  `*[!(_id in path("drafts.**")) && !(_type match "sanity.*") && !(_type match "system.*")]`,
);
const tx = client.transaction();
let count = 0;
for (const doc of docs) {
  const [next, changed] = walk(doc, doc._id as string);
  if (!changed) continue;
  const updated = next as Record<string, unknown>;
  const review = new Set([...((doc.translationReview as string[]) ?? []), ...LANGS]);
  updated.translationReview = [...review];
  count += 1;
  tx.createOrReplace(updated as never);
}
console.log(`${count} documents get IT/DE values${DRY ? " (dry run)" : ""}`);
if (missing.size) console.log("No translation for:", [...missing]);
if (!DRY && count) {
  const result = await tx.commit({ visibility: "async" });
  console.log("tx", result.transactionId);
}
