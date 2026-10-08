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

## Open conflicts reported to the client/owner
- C2 3D step texts differ between 05 and 08 → using 08.
- C3 Reply time "brenda ditës" vs "brenda 24 orësh" → one [TO CONFIRM] value.
- C4 Seed images: 07 says WebP, 09 says JPG masters → plan: JPG masters (Sanity serves AVIF/WebP).
- C5 Navbar 1024–1199: full links (§2.1) vs menu button (§14) → both variants shown in Phase 2 for the owner to choose.
