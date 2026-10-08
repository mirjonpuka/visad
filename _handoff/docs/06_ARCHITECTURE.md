# 06 — Technical Architecture

## 1. Stack
| Layer | Choice |
|---|---|
| Framework | **Next.js** (latest stable, App Router, React Server Components), **TypeScript strict** |
| Styling | **Tailwind CSS** (latest) with the tokens from `02_BRAND_GUIDE.md`; `clsx` + `tailwind-merge` |
| CMS | **Sanity** (embedded Studio at `/studio`), GROQ, `next-sanity`, `@sanity/image-url`, Presentation tool for live preview |
| i18n | `next-intl` (locales `sq` default without prefix, `en`, `it`, `de`; localized pathnames) |
| Motion | `gsap` (+ScrollTrigger, SplitText), `lenis`, `motion` |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` (lazy) |
| Forms | React Hook Form + `zod`, Server Actions, Cloudflare Turnstile, **Resend** for emails |
| File uploads | **Vercel Blob** (client upload with token from a route handler; random suffix; size/type limits) |
| Leads storage | Private Sanity dataset `leads` (written server-side with a write token) |
| Analytics | Vercel Analytics + Speed Insights (cookieless). Google Search Console |
| Hosting | **Vercel** (production + preview deployments per branch), domain `visad.al` (DNS to Vercel), email stays where it is |
| Quality | ESLint, Prettier, Playwright (e2e smoke), Lighthouse CI on previews, `@next/bundle-analyzer` |

## 2. Folder structure
```
visad/
├─ app/
│  ├─ [locale]/
│  │  ├─ layout.tsx              # fonts, providers (Motion, Lenis, Transition, Intro), Navbar, Footer, WhatsAppFab
│  │  ├─ page.tsx                # Home
│  │  ├─ loading.tsx             # Home skeleton
│  │  ├─ (pages)/
│  │  │  ├─ sistemet/page.tsx + loading.tsx
│  │  │  ├─ sistemet/[slug]/page.tsx + loading.tsx
│  │  │  ├─ projektet/page.tsx + loading.tsx
│  │  │  ├─ projektet/[slug]/page.tsx + loading.tsx
│  │  │  ├─ fabrika/page.tsx
│  │  │  ├─ zgjidhje/[segment]/page.tsx
│  │  │  ├─ karriera/page.tsx, karriera/[slug]/page.tsx
│  │  │  ├─ kontakt/page.tsx
│  │  │  └─ privatesia/page.tsx
│  │  └─ not-found.tsx
│  ├─ studio/[[...tool]]/page.tsx   # Sanity Studio
│  ├─ api/
│  │  ├─ revalidate/route.ts        # Sanity webhook → revalidateTag
│  │  ├─ upload/route.ts            # Vercel Blob client-upload token
│  │  └─ draft-mode/enable/route.ts # Sanity Presentation
│  ├─ sitemap.ts, robots.ts, manifest.ts
│  └─ og/[...]/route.tsx            # dynamic OG images (next/og)
├─ components/
│  ├─ layout/      Navbar, MegaMenu, MobileMenu, Footer, WhatsAppFab, CookieBanner, Breadcrumbs, LanguageSwitcher
│  ├─ ui/          Button*, LinkArrow, IconButton, Chip, Tabs, Accordion, Input, Select, FileDrop, Stepper, Lightbox
│  ├─ media/       CMSImage, PlaceholderImage, Skeleton*, VideoBackground
│  ├─ sections/    HomeHero, StatsBand, ProfileStory, SystemsAccordion, FeaturedProjects, FactoryTeaser, Solutions, AlumilBand, CtaBand, ...
│  ├─ motion/      MotionProvider, LenisProvider, TransitionProvider, TransitionLink, IntroOverlay, Reveal, SplitHeadline, Parallax, Magnetic, Cursor, CountUp
│  ├─ three/       ProfileScene, profileShapes.ts, materials.ts
│  └─ forms/       QuoteForm, TenderForm, JobApplicationForm, actions.ts, schemas.ts
├─ sanity/
│  ├─ schemaTypes/  (see 07_CMS_SCHEMA.md)
│  ├─ structure.ts  # Studio desk structure (Projektet first)
│  ├─ lib/client.ts, lib/queries.ts, lib/image.ts, lib/fetch.ts (with cache tags)
│  └─ sanity.config.ts
├─ i18n/  routing.ts (locales + pathnames), request.ts, messages/{sq,en,it,de}.json (UI strings only)
├─ lib/   utils.ts, seo.ts (metadata + JSON-LD builders), device.ts
├─ public/
│  ├─ brand/logo/*, brand/3d/profile-exploded.webp, brand/intro/
│  └─ images/  (WebP only; seed images from this package `images/web/`)
├─ scripts/ optimize-images.mjs, seed-sanity.ts
└─ tailwind.config.ts, next.config.ts, middleware.ts (next-intl)
```

## 3. Routing & i18n
- `next-intl` middleware: `locales: ['sq','en','it','de']`, `defaultLocale: 'sq'`, `localePrefix: 'as-needed'` (Albanian at `/`, others prefixed).
- Localized static pathnames in `i18n/routing.ts`:

| key | sq | en | it | de |
|---|---|---|---|---|
| `/sistemet` | /sistemet | /systems | /sistemi | /systeme |
| `/projektet` | /projektet | /projects | /progetti | /projekte |
| `/fabrika` | /fabrika | /factory | /fabbrica | /fabrik |
| `/zgjidhje` | /zgjidhje | /solutions | /soluzioni | /loesungen |
| `/karriera` | /karriera | /careers | /lavora-con-noi | /karriere |
| `/kontakt` | /kontakt | /contact | /contatti | /kontakt |
| `/privatesia` | /privatesia | /privacy | /privacy | /datenschutz |

- Dynamic slugs (systems, projects, jobs, solutions) have a **slug per locale** in the CMS; the language switcher maps to the same document's slug in the other locale.
- Content fallback order when a translation is missing: requested locale → `en` → `sq`. Never show an empty field.
- UI strings (buttons, labels, form messages) live in `messages/*.json`; all content lives in Sanity.
- **No automatic browser-language redirect** (Albanian is the default); the switcher remembers the choice in a `NEXT_LOCALE` cookie.

## 4. Rendering & caching
- All public pages are **static** (SSG) with `generateStaticParams` for every locale × slug, revalidated **on demand**:
  - Every `sanityFetch` call sets cache tags (`project`, `project:<slug>`, `system`, `settings`, …).
  - Sanity webhook (on publish) → `POST /api/revalidate` (secret-verified) → `revalidateTag(type)` and `revalidateTag(type:slug)`.
  - Fallback time-based revalidation: 1 hour.
- Draft mode + Sanity Presentation tool for live preview of unpublished content (editors see the real page while editing).
- Projects filtering runs on the client from a pre-fetched list (lightweight fields only).

## 5. Images (WebP everywhere)
- **CMS images:** always through `CMSImage` → Sanity CDN URL built with `@sanity/image-url` using `.auto('format')` (serves **AVIF/WebP**), `.quality(78)`, `.fit('crop')` with the hotspot, widths from the `sizes` attribute. Use `next/image` with a custom `loader` that builds the Sanity URL (no double optimization).
- **Static images in `/public`:** only `.webp` (and `.avif` where it helps). `scripts/optimize-images.mjs` (sharp) converts any source JPG/PNG to WebP q80 in widths 640/960/1600/2560 and prints the `<CMSImage>`-compatible metadata (width, height, blurDataURL).
- `next.config.ts`: `images.formats = ['image/avif','image/webp']`, `remotePatterns` for `cdn.sanity.io`.
- LQIP: Sanity `metadata.lqip` (base64) used as `blurDataURL`. Hero image: `priority` + `fetchPriority="high"`; everything else lazy.
- Max image weights: hero ≤ 250KB at 1920w, tiles ≤ 120KB, thumbnails ≤ 40KB.
- Videos: MP4 (H.264) + WebM, ≤ 4MB, muted, `playsinline`, poster image, lazy-start when visible, paused when off-screen; never autoplay on `saveData`.

## 6. Skeleton loading
- `loading.tsx` per route renders the page-shaped skeleton (see UI spec §13). React `Suspense` boundaries around slow parts (related projects, downloads) with matching skeletons.
- Client data (filters, forms upload progress) show inline skeletons/progress.

## 7. Forms flow
1. Client validates with zod (same schema reused on server).
2. Files upload directly to **Vercel Blob** via a token from `/api/upload` (limits: images ≤ 10MB jpg/png/webp/heic for quotes; pdf/dwg/zip ≤ 25MB for tenders; pdf ≤ 5MB for CVs).
3. Server Action verifies Turnstile + honeypot, re-validates with zod, then:
   - creates a document in the private Sanity dataset `leads` (`quoteRequest` / `tenderRequest` / `jobApplication`) with the blob URLs,
   - sends a notification email via Resend to `siteSettings.leadEmail` (default info@visad.al) with all fields and file links,
   - sends a confirmation email to the customer (localized), if an email was provided.
4. Returns success → UI success panel. Errors are logged (Vercel logs) and the user sees a retry banner.
- Rate limit: 5 submissions / 10 min / IP (Vercel KV or Upstash Redis, optional).

## 8. SEO
- `generateMetadata` per page from CMS `seo` fields (title ≤ 60, description ≤ 155), canonical URL, `alternates.languages` hreflang for all 4 locales + `x-default` (sq).
- `sitemap.ts` with all locales and slugs; `robots.ts`.
- JSON-LD: `HomeAndConstructionBusiness` (name, address, geo, phones, opening hours, sameAs) on all pages; `BreadcrumbList`; `Product`-like `ItemList` for systems; `CreativeWork` for projects (name, image, locationCreated).
- OG images: generated with `next/og` (dark background, logo, page title, project image where available).
- **Redirects** (next.config): `/galeria` → `/projektet` (301), `/kontakt/` → `/kontakt`, any `/wp-*` path → `/`.
- Target keywords (AL): "dyer alumini Shkodër", "dritare alumini Shkodër", "dritare PVC Shkodër", "fasada alumini", "parmakë xhami", "sisteme rrëshqitëse alumini", "ALUMIL Shkodër". EN/IT/DE: "aluminium windows Albania", "finestre alluminio Albania", "Aluminiumfenster Albanien".
- Google Business Profile: link the site, same NAP (name, address, phone) as the JSON-LD.

## 9. Performance budgets (CI fails if exceeded)
| Metric | Target |
|---|---|
| Lighthouse Performance (mobile / desktop) | ≥ 90 / ≥ 95 |
| LCP (4G, mid phone) | < 2.2s |
| CLS | < 0.05 |
| INP | < 200ms |
| First-load JS (Home, without three.js) | ≤ 180KB gzip |
| Fonts | 2 families via `next/font`, `display: swap`, `latin` + `latin-ext` subsets |

## 10. Security & privacy
- Sanity tokens server-only; `leads` dataset private; Studio access via Sanity roles (client = Editor, developer = Administrator).
- CSP headers (allow Sanity CDN, Vercel Blob, Turnstile, Resend not needed client-side), `X-Frame-Options: DENY` (except `/studio`).
- GDPR: consent checkbox on forms, privacy page, cookie banner only if non-essential cookies are added (Vercel Analytics is cookieless).

## 11. Environment variables
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_LEADS_DATASET=leads
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=          # leads only
SANITY_REVALIDATE_SECRET=
RESEND_API_KEY=
LEADS_FROM_EMAIL=noreply@visad.al
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://visad.al
```

## 12. Phase-2 hooks (build the seams now)
- `configurator` route group reserved; `system` documents already store series, sizes and finishes needed by a configurator.
- `project.beforeAfter` field in schema (hidden in UI until the component ships).
- `clientPortal` not started; keep auth out of the launch bundle.
