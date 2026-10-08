# 00 — Claude Code: Master Prompt + Phase Prompts

How to use:
1. Create an empty folder `visad/`, copy this whole package into `visad/_handoff/`.
2. Open the folder in Claude Code.
3. Paste **Prompt 0 (Master)** once. Then paste the **phase prompts one at a time**, and review the result in the browser after each phase before moving on. Do not paste everything at once.

---

## Prompt 0 — Master context (paste first)

```
You are the lead developer for the new website of VISAD Construction (visad.al), a certified ALUMIL
partner in Shkodër, Albania, that fabricates and installs aluminium/PVC doors, windows, sliding systems,
shutters, balconies/railings and façades in its own factory.

All requirements are in ./_handoff. Before writing any code, read these files completely, in this order:
  _handoff/docs/01_PROJECT_BRIEF.md     (business context and decisions)
  _handoff/docs/02_BRAND_GUIDE.md       (design tokens: colours, type, grid, logo rules)
  _handoff/docs/03_UI_UX_SPEC.md        (every page, section, component, state, breakpoint)
  _handoff/docs/04_MOTION_SPEC.md       (intro, page transitions, scroll/hover animations, exact timings)
  _handoff/docs/05_3D_PROFILE_SPEC.md   (scroll-driven 3D aluminium profile)
  _handoff/docs/06_ARCHITECTURE.md      (stack, folders, i18n, caching, images, forms, SEO, budgets)
  _handoff/docs/07_CMS_SCHEMA.md        (Sanity schemas = the database, GROQ queries, seed data)
  _handoff/docs/08_CONTENT.md           (all copy in Albanian + English)
  _handoff/docs/09_ASSETS.md            (which image goes in which slot)
  _handoff/brand/                       (logo SVGs, favicons, working intro animation demo)
  _handoff/images/                      (edited photos: web/ = WebP to use, crops/ = hero crops)

Non-negotiable rules:
- Stack: Next.js App Router + TypeScript strict + Tailwind + Sanity + next-intl + GSAP/Lenis/Motion + R3F.
- Laptop-first design at 1440px, then tablet, then phone. Nothing may scroll horizontally at 360px.
- Albanian is the default language at "/", then /en, /it, /de with localized pathnames.
- Every image is served as WebP/AVIF (Sanity CDN auto=format or pre-converted .webp in /public).
  No .jpg/.png is ever shipped to the browser except favicons.
- Every route has a loading.tsx skeleton with the exact final layout; every image shows a skeleton +
  LQIP blur until loaded; CLS must stay < 0.05.
- Missing images render PlaceholderImage with a tiny note centred at the bottom saying what photo belongs
  there (spec: UI §13.3). Project pages may only use real Visad photos.
- Motion is "cinematic everywhere" exactly as in 04_MOTION_SPEC.md, and everything respects
  prefers-reduced-motion. three.js must never be in the initial bundle.
- Use the tokens/names from the docs exactly. Do not invent stats, specs, certifications or project data;
  use [TO CONFIRM] placeholders where data is missing.
- Accessibility: real buttons/links, visible focus, keyboard support, AA contrast.
- Work in small steps. After each phase: run lint + typecheck + build, fix all errors, then give me a short
  summary (what was built, how to see it, what is left/blocked). Commit after each phase.

Reply first with: (1) your understanding in 10 bullet points, (2) any contradictions or missing
information you found in the docs, (3) the phase plan you will follow. Do not start coding until I say go.
```

---

## Phase 1 — Project setup & design system
```
Phase 1. Set up the project:
- Create the Next.js app (TypeScript, App Router, Tailwind, ESLint), Prettier, path alias @/.
- Install: next-intl, next-sanity, @sanity/image-url, sanity, sanity-plugin-internationalized-array,
  gsap, lenis, motion, clsx, tailwind-merge, lucide-react, zod, react-hook-form.
- Tailwind config with ALL tokens from 02_BRAND_GUIDE.md (colors, font sizes with clamp, spacing,
  container, radius, easing & duration tokens as CSS variables).
- Fonts Geist + Geist Mono via next/font/google (latin + latin-ext).
- Copy _handoff/brand/logo into public/brand/logo, favicons into app/ (icon, apple-icon), manifest.ts.
- next-intl routing with locales sq (default, no prefix), en, it, de and the localized pathnames table.
- Build the UI kit in components/ui and components/media: ButtonPrimary/Secondary/WhatsApp, LinkArrow,
  IconButton, Chip, SectionHeader, Accordion, Tabs, Skeleton (all variants), PlaceholderImage, CMSImage
  (temporary: accepts local images until Sanity exists).
- A /[locale]/dev/kit page that shows every component in all states on dark and light backgrounds.
Acceptance: build passes, /dev/kit renders correctly at 1440, 1024, 768 and 390 wide.
```

## Phase 2 — Layout shell (navbar, menus, footer, WhatsApp)
```
Phase 2. Build Navbar (with hide-on-scroll), MegaMenu (Sistemet, Zgjidhje), MobileMenu, LanguageSwitcher,
Footer, WhatsAppFab, CookieBanner, Breadcrumbs, skip link — exactly per UI spec §2 — inside
app/[locale]/layout.tsx. Use static placeholder data for menu items for now.
Acceptance: keyboard-only navigation works through all menus; Esc closes them; focus is trapped in the
mobile menu; the language switcher keeps the current page.
```

## Phase 3 — Sanity CMS (database) + seed
```
Phase 3. Implement Sanity exactly per 07_CMS_SCHEMA.md: embedded Studio at /studio, all object and document
types, internationalized arrays (sq required), Studio desk structure (Projektet first, singletons for
siteSettings/homePage/factoryPage), the second workspace for the private "leads" dataset, document badges
for missing translations, validation rules (no placeholder images on projects).
Write scripts/seed-sanity.ts that uploads all images from _handoff/images/web (largest WebP of each) with
alt texts from _handoff/images/manifest.json and creates the seed documents described in §6, using the
content from 08_CONTENT.md. Create sanity/lib (client, image builder with auto('format'), sanityFetch with
cache tags) and GROQ queries. Switch CMSImage to Sanity images (custom next/image loader, LQIP blur,
hotspot). Add /api/revalidate for the webhook and draft mode for the Presentation tool.
Acceptance: I can open /studio, edit a project, publish, and see it update on the site.
```

## Phase 4 — Home page (static layout first, no motion yet)
```
Phase 4. Build the Home page sections 3.1–3.8 from 03_UI_UX_SPEC.md with real CMS data, WITHOUT the
advanced motion (only basic hovers). For the 3D section render the static fallback layout for now
(image + 5 steps). Include the Home loading.tsx skeleton.
Acceptance: pixel-faithful to the spec at 1440; correct at 1024/768/390; Lighthouse ≥ 95 a11y.
```

## Phase 5 — Motion system
```
Phase 5. Implement 04_MOTION_SPEC.md: MotionProvider (reducedMotion, isTouch, isLowPower), Lenis+GSAP
integration, SplitHeadline, Reveal, ImageWipe, Parallax, CountUp, Magnetic, custom Cursor, hairline draw,
CTA swoosh scrub, scroll progress bar, mega/mobile menu animations, systems accordion animation.
Then the IntroOverlay (port _handoff/brand/intro/logo-intro-demo.html, first visit only, skippable) and the
TransitionProvider/TransitionLink page transitions. Clean up all triggers on route change.
Acceptance: 60fps scrolling on a mid laptop; reduced-motion mode shows no movement except short fades;
no layout shift caused by animations.
```

## Phase 6 — 3D profile story
```
Phase 6. Implement 05_3D_PROFILE_SPEC.md: procedural profile geometry, materials, lighting, pinned scroll
timeline with the 5 steps, lazy loading, PerformanceMonitor and all fallbacks, plus the dev route to export
the static render → save public/brand/3d/profile-exploded.webp (+1200w). Verify with bundle analyzer that
three.js is not in the Home first-load bundle.
```

## Phase 7 — Inner pages
```
Phase 7. Build, in this order, with loading.tsx skeletons and generateMetadata for each:
Systems index → System detail → Projects index (URL-synced filters, FLIP, load more, empty state, mobile
bottom sheet) → Project detail (facts bar, gallery + Lightbox, next project) → Factory (horizontal process
section) → Solution template → Careers + Job detail → Privacy → 404.
Stop after each page and show me before continuing.
```

## Phase 8 — Forms & leads
```
Phase 8. Build the Contact page with the 2-step Quote form and the Tender/B2B form, plus the job
application form, per UI spec §11 and Architecture §7: zod schemas shared client/server, Vercel Blob
uploads with progress, Turnstile + honeypot, Server Actions that save to the Sanity "leads" dataset and
send Resend emails (notification to leadEmail + localized confirmation), success and error states.
Acceptance: submitting each form creates a lead document and an email; errors keep the user's data.
```

## Phase 9 — SEO, i18n completion, performance, QA
```
Phase 9. Complete EN/IT/DE (translate from EN; mark IT/DE "Rishiko" in CMS), hreflang, sitemap, robots,
JSON-LD, OG images, redirects from the old WordPress URLs, security headers.
Run Lighthouse (mobile + desktop) on Home, Projects, Project detail, Contact and fix everything below
the budgets in Architecture §9. Run Playwright smoke tests (navigation, language switch, filters, forms,
reduced motion). Give me a final QA report and a list of [TO CONFIRM] items for the client.
```

## Phase 10 — Launch
```
Phase 10. Prepare the Vercel production deployment: env vars checklist, Sanity webhook to /api/revalidate,
CORS origins, domain visad.al + www redirect, Google Search Console + sitemap submit, Google Business
Profile link. Write README.md with: how to run locally, how editors add a project (step by step with
screenshots placeholders, in Albanian), and how to replace a placeholder image.
```

---

## Tips while working with Claude Code
- If it drifts from the design, paste the exact section of `03_UI_UX_SPEC.md` again and say "match this exactly".
- Ask for one page/section at a time (you prefer incremental work: keep it that way).
- When it asks about missing data, the answer is almost always "use a [TO CONFIRM] placeholder".
