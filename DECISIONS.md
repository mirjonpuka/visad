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

## Phase 4 — Home page (static layout)

| # | Decision | Why |
|---|---|---|
| D4.1 | Home built from `HOME_QUERY` + `getSiteData()` (solutions); sections 3.1–3.8 as server components, only the systems accordion is a client component | UI §3; minimal client JS |
| D4.2 | **No photo appears twice on Home**: audience cards (homeowners, developers, hotels) use temporary stock photos; Sliding systems and Shutters thumbnails too (system detail heroes keep real photos). Applied to Sanity with `scripts/migrations/001-no-repeated-photos.mts`; seed updated | Owner rule "don't repeat the pictures"; Brand §5 allows stock in atmosphere slots |
| D4.3 | 3D section (§3.3A) uses the static fallback layout with a temporary photo of a real aluminium profile section (note: "will be replaced with the 3D render") | Phase 4 prompt; render is exported in Phase 6 |
| D4.4 | New field `homePage.profileStoryTitle` ("Inxhinieri në çdo milimetër."); seed fills fields added later with `setIfMissing` | Text in UI §3.3 had no CMS field |
| D4.5 | Section eyebrows ("01 — Sistemet" …), "Partner i certifikuar i ALUMIL", "Shiko projektin", "Certifikatat" are UI strings in `messages/*.json` | Static labels, not editorial content |
| D4.6 | Side image of the systems accordion from tablet (768) up, inline image on phone | UI §14 table: tablet = side image |
| D4.7 | Project tile meta = "Qyteti · first system · Viti" (empty parts skipped) | UI §3.4 |
| D4.8 | ALUMIL band logo box shows "Logo zyrtare e partnerit ALUMIL" in Mono until the official kit arrives | Never imitate the ALUMIL logo |
| D4.9 | Hero: extra top shade (ink 70% → transparent, 224px) so white navbar content stays readable over bright photos | Visual check over the terrace photo |
| D4.10 | Hero video (optional CMS field) is not rendered yet | Added with the motion work (lazy start, saveData) in Phase 5 |
| D4.11 | CTA swoosh: logo swoosh path stretched to the section (`preserveAspectRatio="none"`, 1px non-scaling stroke, 20%) | Full S visible at every width; draws on scroll in Phase 5 |
| D4.12 | Language links named "EN · English" etc. | WCAG 2.5.3 (label in name), flagged by Lighthouse |
| D4.13 | Phone factory carousel is focusable (`tabIndex=0`) with `scroll-padding` so the first card aligns with the gutter | axe `scrollable-region-focusable` |
| D4.16 | ALUMIL logo: official SVG in `public/brand/partners/alumil-logo.svg` (supersedes D2.16, D4.8). Shown full colour on light backgrounds (band, 220px); on dark backgrounds (footer, 120px) on a light alu-100 tile, never recoloured. A logo uploaded in Sanity (Cilësimet → Partner ALUMIL) takes precedence | Owner provided the logo; partner logos must keep their colours |
| D4.15 | Home lives in the route group `app/[locale]/(home)/` with its own `loading.tsx` | A `loading.tsx` directly in `[locale]` wrapped every route (incl. the 404 catch-all) in the Home skeleton and broke its prerender |
| D4.14 | Accessibility checked with axe (Playwright, 4 widths, 0 serious/critical) and Lighthouse (Accessibility 100 desktop + mobile) | Phase 4 acceptance |

## Phase 5 — Motion system

| # | Decision | Why |
|---|---|---|
| D5.1 | Motion stack: GSAP 3 (ScrollTrigger, SplitText with masked lines) + `@gsap/react`, Lenis on the GSAP ticker. Motion JS on first load ≈ 51KB gzip | Motion §1, budget ≤ 60KB |
| D5.2 | `MotionProvider` exposes reducedMotion / isTouch / isLaptop / isLowPower (useSyncExternalStore on media queries) | One source for all motion decisions |
| D5.3 | Lenis only with a fine pointer and without reduced motion; touch phones keep native scroll | Motion §1 |
| D5.4 | Hidden-before-reveal styles apply only under `html.js-motion` (set by a tiny head script, not with reduced motion), plus a 3s CSS safety that shows everything if JS never runs the reveal | No invisible content without JS / on errors |
| D5.5 | Intro (first visit only, `localStorage visad-intro-seen`) is driven by CSS from first paint; JS syncs the WAAPI clock and handles skip (key, click, wheel, touch). The hero entrance listens to `html[data-hero-in]` | Timers started at hydration were late by the hydration time |
| D5.6 | Route changes are broadcast by one `<RouteChangeEmitter>` inside `<Suspense>`; providers subscribe with `useRouteChange` | `usePathname` in wrapping providers postponed the whole prerendered shell of dynamic routes |
| D5.7 | Page transitions: document-level click interception of internal links (no special `TransitionLink`), red panel with the destination title; skipped for hreflang links, new tabs, downloads, /studio, /api, same page; browser back/forward use a short crossfade | Every link (incl. CMS content) gets the transition |
| D5.8 | Custom cursor and magnetic buttons only on laptop with a fine pointer (≥1200px), off with reduced motion; magnetic = 30% element / 15% label, power3.out return | UI §14, Motion §5 |
| D5.9 | `VisualEditing` loaded with `next/dynamic` only in Draft Mode | Keep the Studio overlay out of the public bundle |
| D5.10 | Feature flags moved to `lib/flags.ts` | `CookieBanner` importing `lib/site.ts` pulled both image manifests (17KB gzip) into every page |
| D5.11 | Optional hero video (CMS): mounted after `load`, never with reduced motion / low-power / Save-Data, paused off screen; the image stays as poster and LCP | UI §3.1, Motion §1 |
| D5.12 | Playwright runs as a returning visitor (intro already seen); `intro.spec.ts` covers first visit + reduced motion | Intro would cover the page in every test |

## Phase 6 — 3D profile story

| # | Decision | Why |
|---|---|---|
| D6.1 | Procedural geometry exactly per 05 §Geometry (shapes + chamber holes, 220mm extrusion, bevel 0.4); dovetail ends drawn as 2mm flares that key into both shells | No model file to download |
| D6.2 | Server HTML is always the static layout (render + list). The client decides once on mount: WebGL2, ≥768px, fine pointer, not low-power, no reduced motion → pinned scene. Phones never download three.js | 05 §Fallbacks; no layout change for phones (no CLS) |
| D6.3 | Scroll progress lives in a tiny store (`components/three/profileStore.ts`, no three.js imports) written by a scrubbed ScrollTrigger (pin, +250%) and read in `useFrame`; all values damped (lambda 6), `frameloop="demand"`, `"never"` off screen | 05 §Tech; no React re-render per frame |
| D6.4 | Reflections from three's procedural `RoomEnvironment` (PMREM, once) instead of drei `<Environment>` + Lightformers | Lightformer reflections left flat metal faces almost black in tests; still no HDR file |
| D6.5 | Own frame-rate guard instead of drei `PerformanceMonitor`: counts only continuous frames while animating; < 40fps for 2s → cheap glass, again → crossfade (400ms) to the static image, pin and steps keep working | With on-demand rendering, idle gaps read as low fps in PerformanceMonitor |
| D6.6 | Framing centred on the frame without glass (y 62mm) so the glass slides in from above the view in step 4 | Profile was cropped at the bottom |
| D6.7 | Static render exported by `npm run profile:render` (Playwright reads `/dev/profile-render` at p = 0.5, 2400×1600) → `public/brand/3d/profile-exploded.webp` + `-1200.webp`, flattened on ink-900. Replaces the temporary stock photo (removed) | 05 §Generating the static render |
| D6.8 | Finish toggle "Argjend / Antracit" (laptop) and the "VISAD × ALUMIL" corner label are DOM overlays over the canvas | Crisp text, accessible buttons |
| D6.9 | Lazy 3D chunk = 239KB gzip (three + R3F + ContactShadows), loaded only near the section on capable devices; Home first load unchanged except the section logic (+2.5KB) | 05 estimated 160–200KB; three core alone ≈ 150KB |
| D6.10 | Polymorphic `as` props typed with `HtmlTag` + `htmlRef()` | R3F adds three.js elements to JSX globally, which breaks `ElementType` |
| D6.11 | SplitText masks get 0.16em room below the baseline | The cedilla of "ç" was clipped |

## Phase 7 — Inner pages

| # | Decision | Why |
|---|---|---|
| D7.1 | New singleton **"Faqet e tjera"** (`pageSettings`): systems hero/title/intro/key specs, projects intro, careers hero/intro/benefits, contact lead. Revalidation tag `pages` | Index pages had no CMS document; 03 needs editable heroes/intros |
| D7.2 | Sections without CMS content are not rendered (overview, series, specs, finishes, FAQ, benefits, gallery, story, team, downloads); the system sub-nav only lists sections that exist | Never invent specs or details (08); the client fills them later |
| D7.3 | Detail pages: `generateStaticParams` per locale from Sanity (`lib/static-params.ts`); a placeholder param when a type is empty (Cache Components needs ≥ 1); later documents render on first request behind `loading.tsx` | Prerendered pages, no build error with zero jobs |
| D7.4 | A slug from another language redirects (308) to this language's slug; the language switcher gets each document's slugs through `<AlternateSlugs>` (tiny client store) | Switching language keeps the user on the same document (UI §0.7) |
| D7.5 | `pageMetadata()` for every page: CMS SEO fields win, canonical + hreflang alternates (+ x-default = sq) per document | Architecture §6; completed with OG images in Phase 9 |
| D7.6 | Inner-page CTA reuses the Home CTA copy (`PageCta`, tag `home`) | One place to edit |
| D7.7 | Projects: full list in the server HTML, filters on the client, stored in the URL (`?lloji=villa&sistemi=dritare&qyteti=…`) with **pushState** so Back undoes a filter; values are stable keys (type values, Albanian system slugs) in every language. Filters applied after hydration (no `useSearchParams`, which would make the grid client-only) | UI §6.2; shareable links; SEO-visible grid |
| D7.8 | FLIP with Motion (`LazyMotion` + `m` from `motion/react-m`, layout features loaded after hydration): projects page first load +19KB instead of +47KB | Motion §4.7 asks for Motion; keep the page light |
| D7.9 | City filter is a dropdown and only appears with ≥ 2 distinct cities | All seeded cities are [TO CONFIRM] |
| D7.10 | Sticky bars follow the navbar: `html[data-nav-hidden]` set by the Navbar; `.sticky-under-nav` moves to top 0 when the navbar hides | Sub-nav / filters never hidden under the navbar |
| D7.11 | Lightbox: portal dialog, focus trap + return, arrows/swipe/Esc, counter, caption = alt. Tested on `/dev/kit` (no project galleries in the CMS yet) | UI §7.4 |
| D7.12 | Next project = next in the projects order (year desc), wrapping around | Years are not set yet; avoids A↔B loops |
| D7.13 | Factory: stats fall back to the site-wide stats; process pinned horizontally on laptop only (fine pointer, ≥1200px, no reduced motion); `#certifikata` always rendered with the ALUMIL partner card; map loads Google Maps only after a click | UI §8, Motion §4.9; privacy |
| D7.14 | Breadcrumb colours from surface tokens; red numbers on light surfaces use `red-700` (contrast) | axe colour-contrast |
| D7.15 | Job application form slot is in place; the form itself is built with the other forms in Phase 8 | Shared form stack (zod, uploads, Turnstile) |
| D7.16 | Back/forward between filter states of the same page no longer arms the page-transition crossfade | Next real navigation lost its panel transition |

## Phase 8 — Forms & leads

| # | Decision | Why |
|---|---|---|
| D8.1 | One zod schema per form in `lib/forms/schemas.ts`, used on blur/step in the browser and again in the Server Action; error messages are message keys (`form.errors.*`) | Architecture §7.1; localized errors |
| D8.2 | Small own form state hook (`useFormState`) instead of react-hook-form | Chips, stepper and async file lists are simpler as controlled values; values never reset on error |
| D8.3 | Quote step 1 has no required fields (03 marks only name, phone, consent with *); "Vazhdo" still validates the step | Lower barrier for homeowners |
| D8.4 | Job application: CV required, email optional (03 lists the fields without *) | An application without a CV is not useful |
| D8.5 | Uploads go straight from the browser to **Vercel Blob** with a token from `/api/upload` (type + size limited per kind). Without `BLOB_READ_WRITE_TOKEN` (local dev) a fallback stores the file in the private `leads` dataset; it refuses to run on the production deployment | Architecture §7.2; testable before the Blob store exists, never an open endpoint live |
| D8.6 | Leads accept file URLs only from `*.public.blob.vercel-storage.com` or `cdn.sanity.io` | No arbitrary links in lead emails |
| D8.7 | Spam: honeypot (silent fake success) → rate limit 5/10 min/IP (in-memory per instance, production only) → Turnstile "interaction-only" (Cloudflare test keys when not configured; production without a secret fails closed) | Architecture §7.3 |
| D8.8 | Lead is saved first; emails (Resend) are sent after and never block success. Without `RESEND_API_KEY` emails are skipped with a log line. Staff email in Albanian with all fields, file links and a Studio link, reply-to = customer; confirmation localized | A missing/failed email never loses a request |
| D8.9 | `?forma=tender` preselects the tab after hydration (page stays prerendered) | UI §11.2 |
| D8.10 | e2e tests submit real leads named "E2E Test"; `npm run test:cleanup-leads` removes them and their files | Acceptance "creates a lead document" checked against Sanity |
| D8.11 | `.env.example` (names only) committed as the env checklist | Phase 10 |

## Phase 9 — i18n, SEO, performance, QA

| # | Decision | Why |
|---|---|---|
| D9.1 | IT/DE: all UI strings (`messages/it.json`, `de.json`, key parity tested) and all CMS texts machine-translated from EN (`scripts/i18n-content.json` → `migrations/002-translate-it-de.mts`), IT/DE slugs per document | 08 §i18n |
| D9.2 | "Rishiko": new field `translationReview` on every content document + Studio badge "Rishiko IT/DE"; editors untick a language after review | 08: mark machine translations until reviewed |
| D9.3 | `sitemap.xml` (all locales, all document slugs, hreflang alternates, `x-default` = sq), `robots.txt` (Studio/API/dev hidden; preview deployments fully disallowed) | Architecture §8 |
| D9.4 | JSON-LD: `HomeAndConstructionBusiness` on every page (NAP from Sanity, geo/hours/sameAs only once confirmed, no invented `areaServed`), `BreadcrumbList`, `ItemList` (systems), `CreativeWork` (projects; `[TO CONFIRM]` cities left out) | Architecture §8 |
| D9.5 | OG images from `/api/og` (next/og): ink background, red top line, logo, title, project/page photo on the right (Sanity JPEG); only `cdn.sanity.io` images accepted | Architecture §8 |
| D9.6 | Project pages without a CMS summary get a meta description built from their own facts (type, city, year, systems) | Lighthouse SEO; no invented text |
| D9.7 | Redirects: `/galeria(/…)` → `/projektet`, `/wp-*` → `/`, `/xmlrpc.php`, `/feed` → `/` (308 = permanent); `/kontakt/` → `/kontakt` by Next's trailing-slash redirect | Architecture §8 |
| D9.8 | Security headers on every path; CSP on everything except `/studio`. `'unsafe-inline'` scripts (prerendered pages cannot use nonces). **X-Frame-Options SAMEORIGIN / frame-ancestors 'self'** instead of DENY | The Studio's Presentation tool shows the site in a same-origin iframe (conflict C7) |
| D9.9 | Vercel Analytics + Speed Insights (cookieless) inside `<Suspense>` | Architecture §1; they read the URL |
| D9.10 | Logo intro only on the **Home** page (first visit), as listed under UI §3.0 | It covered any first-visited page and delayed its LCP |
| D9.11 | Hero entrance on full page loads is pure CSS from the first paint (`html.hero-css`); GSAP keeps animating heroes after in-app navigations (panel transition) | Hero text/images no longer wait for hydration (LCP) |
| D9.12 | Scroll-reveal setups (SplitText, reveals, wipes, lines, count-ups, parallax) run in idle callbacks, each its own small task | One 1.6s hydration task was most of the mobile TBT (Home 2.9s → 0.36s) |
| D9.13 | Priority images (heroes, first two project tiles) skip the JS fade-in; the 3D scene loads only after the visitor starts scrolling | LCP render delay; 3D was compiling during page load on tall screens |
| D9.14 | Env var name `LEADS_FROM_EMAIL` as in 06 §11 | Spec name |

## Open conflicts reported to the client/owner
- C7 **X-Frame-Options**: 06 §10 asks for `DENY` (except /studio), but the Presentation preview loads site pages inside the Studio → `SAMEORIGIN` (still blocks every other site).
- C8 **Mobile Lighthouse ≥ 90 / LCP < 2.2s** (06 §9) vs. the mandated first-visit logo intro (≈2.3s on Home by design) and the motion stack. Desktop meets the budget; mobile scores 66–86 under Lighthouse's simulated 4× slower CPU. Proposal: judge mobile on real devices with Vercel Speed Insights after launch.
- C6 **First-load JS budget** (06 §Performance: Home ≤ 180KB gzip). Measured: **240KB gzip** — Next.js 16 + React 19 runtime alone ≈ 136KB, motion (GSAP/Lenis, within the 04 budget of 60KB) ≈ 51KB, site code ≈ 45KB. three.js is not included. The 180KB target cannot be met with the mandated stack + motion spec; proposal: accept ≤ 250KB, keep three.js/R3F lazy. Real-world check: CLS 0, no long tasks, Lighthouse in Phase 9.
- C2 3D step texts differ between 05 and 08 → using 08.
- C3 Reply time "brenda ditës" vs "brenda 24 orësh" → one [TO CONFIRM] value.
- C4 Seed images: 07 says WebP, 09 says JPG masters → plan: JPG masters (Sanity serves AVIF/WebP).
- C5 Navbar 1024–1199 → resolved: menu button (D2.4).

