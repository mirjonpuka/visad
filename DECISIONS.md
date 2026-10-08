# Decisions & assumptions

Every decision or assumption not spelled out in `_handoff/`. Newest phase at the bottom.
Conflict rule: `03_UI_UX_SPEC.md` wins for design, `06_ARCHITECTURE.md` for technical choices.

## Phase 0 — Setup

| # | Decision | Why |
|---|---|---|
| D0.1 | Handoff moved from `visad-handoff/visad-handoff/` to `_handoff/` (folder rename only, no file changed) | All docs and prompts reference `_handoff/` |
| D0.2 | Installed Node.js 24 LTS and Git 2.55 via winget | Machine had neither |

## Phase 1 — Project setup & design system

### Stack versions (06 says "latest stable")
| # | Decision | Why |
|---|---|---|
| D1.1 | Next.js 16.4, React 19.3, Tailwind CSS 4.3, next-intl 4.14, Sanity 6, Motion 14, GSAP 3.15, Lenis 1.3, zod 4 | Latest stable at setup time |
| D1.2 | `proxy.ts` instead of `middleware.ts` | Renamed in Next 16 (`middleware` is deprecated) |
| D1.3 | Tailwind v4: tokens live in `app/globals.css` (`@theme`), there is **no `tailwind.config.ts`** | v4 is CSS-first; the docs' file name refers to v3 |
| D1.4 | `cacheComponents` + `partialPrefetching` kept on (create-next-app 16.4 default) | Matches 06 §4: static shell, `use cache` + `cacheTag` for Sanity on-demand revalidation |
| D1.5 | Locale read with `next/root-params` in `i18n/request.ts` | The next-intl 4.14 recommended way; `setRequestLocale` is deprecated |
| D1.6 | `next/image` `priority` is deprecated → `loading="eager"` + `fetchPriority="high"` for LCP images | Next 16 change |
| D1.7 | `images.qualities = [75, 78]` | Next 16 only allows listed qualities; 06 asks for q78 on the Sanity CDN |
| D1.8 | Prettier with `prettier-plugin-tailwindcss`; scripts `lint`, `typecheck` (`next typegen && tsc`), `format`, `check` | Phase 1 prompt |
| D1.9 | `@playwright/test` installed now (used for review screenshots: `node scripts/screenshot.mjs`) | Needed in Phase 9 anyway |

### Tokens
| # | Decision | Why |
|---|---|---|
| D1.10 | Colour tokens keep their exact names but carry Tailwind's namespace: CSS variable `--color-ink-900`, classes `bg-ink-900`, `text-text-on-dark`, `bg-red-600` | v4 generates utilities only from `--color-*`; the doubled `text-text-…` is the price of exact names |
| D1.11 | Tailwind's default colour palette, radius, shadows and easings are removed (`initial`) | Only brand tokens can be used, nothing off-brand by accident |
| D1.12 | Added `whatsapp-ink #08231A` (text on WhatsApp green) as a token | Value is in UI §2.6 / Brand §2 but had no name |
| D1.13 | Type scale tokens `text-display-xl … text-stat` are fluid `clamp()`, linear from 390px (phone value) to 1440px (laptop value), and include line-height, tracking and weight | Brand §3. Effect: hero headline is ~87px at 1024 (UI §14 says 80 for tablet; 80 would need a non-linear curve) |
| D1.14 | Eyebrow/label are used as `font-mono text-eyebrow uppercase` / `font-mono text-label uppercase` | Tailwind font-size tokens cannot also set the family/case |
| D1.15 | Breakpoints exactly as Brand §4 + an extra `laptop: 1200px` | Container padding and section padding switch at 1200 (Brand §4), which is between `lg` and `xl` |
| D1.16 | `site-container` utility (max 1440, padding 20/40/64) instead of overriding Tailwind's `container` | Tailwind's `container` steps max-width per breakpoint, which would break the 64px-padding rule between 1280 and 1440 |
| D1.17 | Hero/CTA section padding (`section-y-xl`): 96 phone / 120 tablet / 140 laptop | Brand §4 only gives the 140 laptop value |
| D1.18 | Durations are CSS variables `--dur-xs…--dur-xl`, used as `duration-(--dur-m)` | Tailwind v4 has no duration theme namespace |
| D1.19 | "Surfaces": sections use `surface-dark` / `surface-light`; skeletons, placeholders, secondary buttons and chips read their colours from the surface | One component works on both backgrounds without tone props |
| D1.20 | Placeholder note colours `#B9BEC5` / `#41464E` used as literals | Given in UI §13.3, not tokens |

### Components
| # | Decision | Why |
|---|---|---|
| D1.21 | Interactive states (hover/active/focus) written in plain CSS (`@layer components`) and forceable with `data-force="hover"` | The dev kit can show every state statically |
| D1.22 | Buttons render as `next-intl` `<Link>` (`href`), `<a>` (`externalHref`) or `<button>`; disabled links get `aria-disabled` + `tabIndex=-1` | Real links/buttons (UI §0.6) |
| D1.23 | WhatsApp button icon = lucide `MessageCircle` | Brand §6 says lucide only; lucide has no brand logos |
| D1.24 | Accordion height uses the CSS `grid-template-rows: 0fr → 1fr` technique for now; closed panels are `inert` | Phase 5 may swap to Motion `height:auto` (Motion §4.5); same visual result |
| D1.25 | Chip border `rgba(0,0,0,.24)` / `rgba(255,255,255,.28)`; tabs active indicator = 2px `red-500` bar | Not specified |
| D1.26 | Temporary `CMSImage` uses a custom `next/image` loader that picks the closest pre-generated WebP width from `/public/images` (no Next optimizer) | Only WebP reaches the browser; Phase 3 swaps the loader to the Sanity CDN |
| D1.27 | Skeleton text widths are deterministic (fixed list 70–95%) | "Random" widths would differ between server and client (hydration mismatch) |
| D1.28 | Reduced motion: all transitions/animations cut to ~0, shimmer hidden; `.motion-fade` keeps a 150ms opacity fade; the button loading spinner keeps spinning (it is a status indicator, not decoration) | Motion §9 |
| D1.29 | Dev routes (`/dev/kit`) render in development and Vercel previews only; production returns 404 unless `ENABLE_DEV_ROUTES=true` | 05 asks for dev routes to be removed from production |
| D1.30 | Placeholder notes on CMS images flagged `isPlaceholder` show in dev/preview only; empty slots (`PlaceholderImage`) always show their note | Brand §5 |

### i18n
| # | Decision | Why |
|---|---|---|
| D1.31 | `localeDetection: false` (no Accept-Language redirect); next-intl still stores `NEXT_LOCALE` when the user switches | Architecture §3 |
| D1.32 | Message fallback for UI strings: locale → en → sq (deep merge). `it.json` / `de.json` are empty until Phase 9 | Architecture §3 |
| D1.33 | `/sq/...` redirects to `/...` (as-needed prefix) | next-intl default with `as-needed` |

### Assets
| # | Decision | Why |
|---|---|---|
| D1.34 | `scripts/sync-handoff-assets.mjs` copies logo files, favicons, WebP images (`web/`, `crops/`) and a trimmed `images.manifest.json` out of `_handoff` | `_handoff` stays untouched; the copy is reproducible |
| D1.35 | Favicons: `app/favicon.ico`, `app/icon.svg` (visad-icon), `app/apple-icon.png`; PWA icons 192/512 in `manifest.ts` | Phase 1 prompt |

### Approved after Phase 1 review
| # | Decision | Why |
|---|---|---|
| D1.36 | Wordmark SVGs in `public/brand/logo/` use viewBox `0 0 1280 500` (handoff files: `0 0 1280 420`). Patched by `scripts/sync-handoff-assets.mjs`; `_handoff` untouched. Rendered size 104×41 (laptop), 88×34 (phone) | The 420 height cut off the swoosh's bottom tail (y 420–500). Approved by owner |
| D1.37 | Cookie banner (C1): component is built (Phase 2) but **off at launch**; turned on only when a non-essential cookie/tracker is added | Architecture §10 wins on technical decisions; Vercel Analytics is cookieless. Approved by owner |

## Phase 2 — Layout shell

| # | Decision | Why |
|---|---|---|
| D2.1 | **Navbar uses the full logo (with "CONSTRUCTION") at 140px**, not the 104px wordmark (overrides Brand §1) | Owner's request. 140px is the full logo's minimum width (Brand §1), so it is 140 on every screen |
| D2.2 | Eyebrow "Sisteme alumini · Shkodër" next to the logo shows only at ≥1440px | With the wider logo it no longer fits beside the links below 1440 |
| D2.3 | Navbar links gap 24px at 1024–1199, 32px from 1200 | The full link row fits from 1024 (checked in EN, the longest labels) |
| D2.4 | **1024–1199 uses the menu button; full links from 1200px** (C5). The comparison toggle was removed | Owner chose "menu" after comparing both |
| D2.5 | Navbar transparency is opt-in per page with `<HeroUnderNav />`; every other page gets the solid navbar from the top | UI §2.1: transparent only over a hero; light page headers would hide white nav content |
| D2.6 | Mega-menu "Sistemet": thumbnail (16:10, 168px) **beside** the name/description; "Zgjidhje": thumbnail above. Panel ≈ 270–300px tall | UI §2.2 asks for ~360px; stacked 16:10 thumbnails in a 3×2 grid made the panel ~660px |
| D2.7 | Mega-menu intro lines: "Sisteme alumini dhe PVC, të prodhuara në Shkodër." (from Systems index h1) and "Për kë punojmë." (Home §3.6 h2). Zgjidhje has no "all" link (there is no solutions index page) | Not specified in 03/08 |
| D2.8 | Mega-menu focus trap engages only when focus is already inside (trigger or panel), so hovering never steals keyboard focus | UI §2.2 trap + hover opening |
| D2.9 | Mobile menu sits under the navbar (z-40 vs z-50); the burger morphs into × and focus is trapped across navbar + menu | Keeps one × button (the morphing burger, Motion §5.7) |
| D2.10 | Menus close on any route change, including back/forward | Avoids a menu left open over a new page |
| D2.11 | Language switcher keeps the internal route + params; dynamic slugs are passed through unchanged until the CMS provides per-locale slugs (Phase 3/7). Query strings are not carried over yet | Architecture §3 |
| D2.12 | Footer "Keni një projekt?" row is a separate `FooterCta` that pages without the CTA section render as their last block (404 now; Careers, Privacy later) | The layout cannot know if a page ends with the CTA section (UI §2.4) |
| D2.13 | Footer "Zgjidhje" link goes to `/#zgjidhje` (Home section) | There is no solutions index route |
| D2.14 | Social links render as Mono text links ("FACEBOOK", "INSTAGRAM") and are hidden while the CMS list is empty | lucide has no brand icons (Brand §6: lucide only) |
| D2.15 | Opening hours show "[TO CONFIRM]" until provided | Never invent data |
| D2.16 | ALUMIL badge in the footer is a small `PlaceholderImage` + "Partner i certifikuar ALUMIL" until the official logo arrives | 09 · `alumil-partner-logo` |
| D2.17 | WhatsApp prefilled message: "Përshëndetje VISAD! Ju shkruaj nga faqja: {page}" / EN equivalent; page = document title | UI §2.5 asks for a localized message incl. page title; wording not given |
| D2.18 | WhatsApp FAB expands with `clip-path` (circle → pill), not a width animation; its wrapper ignores pointer events so the hidden pill area never blocks clicks | Motion §1 (no width animation) |
| D2.19 | FAB appears on mount for now; Phase 5 delays it until the intro finishes | UI §2.5 |
| D2.20 | Footer has extra bottom padding so the FAB never covers its last row | Visual check |
| D2.21 | Cookie banner component complete (12-month cookie `visad-consent`, `visad:consent` event for future analytics); `COOKIE_BANNER_ENABLED = false` | D1.37 |
| D2.22 | Basic localized 404 inside the layout (`[...rest]` catch-all, `instant = false`); full 404 design in Phase 7 | Nav links to unbuilt pages must not drop the site chrome |
| D2.23 | Static menu/contact data in `lib/site.ts` until Phase 3 (Sanity) | Phase 2 prompt |
| D2.24 | Playwright smoke tests in `tests/e2e/layout.spec.ts` (`npm run test:e2e`, 2 workers locally) | Phase 2 acceptance; reused in Phase 9 |

### Owner request after Phase 2: real-looking placeholder photos
| # | Decision | Why |
|---|---|---|
| D2.25 | Empty image slots get a **temporary stock photo** (Pexels License: free commercial use, no attribution required) with a small note at the bottom centre: "Temporary photo · will be replaced with …". Grey `PlaceholderImage` remains only as a last-resort fallback | Owner request; replaces the grey-box design of UI §13.3 / Brand §5 |
| D2.26 | The note on temporary photos shows **in every environment**, including production (supersedes D1.30) | Owner request; Brand §5 also says production shows the note while the slot is still a placeholder |
| D2.27 | **Project pages and project tiles never use stock photos**, only real Visad photos | Brief §"Proof points", Brand §5: stock labelled as a Visad project would misrepresent their work |
| D2.28 | No photo is repeated across the menus: Dyer → stock door detail, Fasada → stock aluminium/glass façade (09 assigned Fishta Hotel to both Fasada and Hotels; Fishta stays on Hotels) | Owner: "you don't have to repeat the pictures" |
| D2.29 | Stock set: 14 photos for systems hero, doors, sliding, façades, factory machines ×4, process steps ×5, architects. List + notes + alt texts in `scripts/stock-photos.json`; `node scripts/import-stock.mjs` downloads and converts to WebP (`public/images/stock/`, `lib/stock.manifest.json`) | Reproducible; Phase 3 seeds them into Sanity with `isPlaceholder: true` |
| D2.30 | No stock photos for **team portraits** (the team section stays hidden until real photos exist) and no imitation of the **ALUMIL logo** (footer shows a text badge) | Stock people would be presented as Visad staff; the ALUMIL logo must come from their partner kit |
| D2.31 | Small thumbnails (mega-menus) show only "Temporary photo"; large images show the full note | The full sentence does not fit 168–250px thumbnails |
| D2.33 | Notes on temporary photos: Mono 8px, padding 2×6px, 8px from the bottom (smaller than the 10px of UI §13.3) | Owner: "the font on the pics can be smaller" |
| D2.32 | `experimental.turbopackFileSystemCacheForDev: false` | The dev cache served stale `globals.css` across restarts (twice); production build cache unaffected |

## Phase 3 — Sanity CMS + seed

| # | Decision | Why |
|---|---|---|
| D3.1 | Studio embedded at `/studio` with **two workspaces**: `/studio/permbajtja` (dataset `production`) and `/studio/kerkesat` (private dataset `leads`). The `npm create sanity` standalone studio was **not** used | Architecture §2 (one app, one deploy) |
| D3.2 | `sanity.config.ts` / `sanity.cli.ts` at the project root (06 shows `sanity/sanity.config.ts`) | The Sanity CLI looks for them in the root |
| D3.3 | **GROQ uses `language == $locale`**, not `_key == $locale` as in 07 §1/§5 | `sanity-plugin-internationalized-array` v5 stores the language in a `language` field |
| D3.4 | Localized slugs: `internationalizedArraySlug` (custom field type), generated from the title in the same language; slugify strips ë/ç accents | CMS §1 |
| D3.5 | "Sq required" rule on localized fields; others optional with locale → en → sq fallback in every query | CMS §1, Architecture §3 |
| D3.6 | Badge "Mungon EN/IT/DE" on documents missing translations of their main field(s); lead status shown as coloured badge | CMS §1, §4 |
| D3.7 | Projects: field groups "Bazë" / "Më shumë", template "Projekt i ri" (country = Shqipëri), cover required, **placeholder photos rejected** on cover and gallery | CMS §3 project |
| D3.8 | Extra fields not in 07: `solution.cardText` (one line for the mega-menu/cards), `solution.heroTitle`, `homePage.factoryImages`, reusable `step` object | Needed by UI §2.2, §3.5, §3.6, §9 |
| D3.9 | Seed uploads the **edited JPG masters** (C4) for real photos and the 2400px WebP for stock photos; Sanity serves both as AVIF/WebP | C4 |
| D3.10 | Seed **publishes** the 7 projects (07 §6 says drafts) with names/city marked `[TO CONFIRM]` (except Fishta Hotel) | Home and Projects need published projects to be built and reviewed; client can unpublish any |
| D3.11 | Project type, systems used and audience of the 7 seed projects are inferred from the photos and must be confirmed (TODO_CLIENT) | No project data provided |
| D3.12 | Solutions' recommended systems seeded as a reasonable default (homeowners: doors/windows/shutters; developers: windows/balconies/façades; hotels: sliding/balconies/façades; architects: façades/windows/sliding) | Editable in Studio |
| D3.13 | System specs, series, benefits and FAQs are **not** seeded | 08: only ALUMIL datasheet values |
| D3.14 | Seed is idempotent: `npm run seed` only creates missing documents; `npm run seed -- --force` replaces them | Re-running must never overwrite Studio edits |
| D3.15 | Data layer: one `sanityFetch` with `'use cache'` + `cacheTag` (own tags: type, `type:slug`, `settings`, `home`, `factory`) + `cacheLife('hours')`; `$locale` read from the root param inside the cache scope. `defineLive` / Sanity Live **not** used | Architecture §4 asks for webhook + tag revalidation; Live opens a connection per visitor |
| D3.16 | Draft Mode: `/api/draft-mode/enable` (`defineEnableDraftMode`), drafts read with the read token, stega + `<VisualEditing />` only in Draft Mode; a small "Parapamje · Dil" banner outside the Presentation iframe | Architecture §4 |
| D3.17 | Webhook `/api/revalidate`: signature-checked, projection `{_type, "slugs": slug[].value.current}`, `revalidateTag(tag, { expire: 0 })` so editors see changes immediately | Architecture §4 (Next 16 requires a profile argument) |
| D3.18 | In development the cache revalidates after 5s (`{stale:30, revalidate:5, expire:300}`) because the webhook cannot reach localhost; edits show within ~20s | Owner can test the Studio → site loop locally |
| D3.19 | `[locale]` layout exports `instant = false` (dev insight "URL data"): the layout is localized, so it cannot be in the locale-independent App Shell; it is still fully prerendered per locale. Pages stream behind their `loading.tsx` skeletons | Next 16.4 Partial Prefetching |
| D3.20 | Navbar, mega-menus, mobile menu, footer and WhatsApp number/message now come from Sanity (`getSiteData()` + `SiteDataProvider`); `lib/site.ts` is only the seed source | Phase 3 |
| D3.21 | `CMSImage` renders Sanity images through a custom `next/image` loader (Sanity CDN, `auto=format`, q78, crop applied, `fit=max`); hotspot → `object-position` | Architecture §5 |
| D3.22 | `@sanity/icons` v5 only exports `<Icon symbol>`: a tiny `icon("cog")` helper wraps it | Library change |
| D3.23 | Dev-only `/dev/cms` lists the projects from Sanity to check the edit → publish → refresh loop before Phase 7 pages exist | Phase 3 acceptance |

## Open conflicts reported to the client/owner
- C2 3D step texts differ between 05 and 08 → using 08.
- C3 Reply time "brenda ditës" vs "brenda 24 orësh" → one [TO CONFIRM] value.
- C4 Seed images: 07 says WebP, 09 says JPG masters → plan: JPG masters (Sanity serves AVIF/WebP).
- C5 Navbar 1024–1199 → resolved: menu button (D2.4).
