# QA report — visad.al (Phase 9)

Date: 2026-10-09 · Build: Next.js 16.4 production build, tested locally (`next start`) · Data: Sanity `production`

## 1. Automated tests (Playwright, `npx playwright test`)
**53 / 53 passing** on the production build (and on the dev server).

| Area | What is checked |
|---|---|
| Layout | skip link first, keyboard menus, Esc, focus trap in mobile menu, navbar hide/show, language switcher, no horizontal scroll 360–1440 |
| Home | all sections, one h1, axe at 1440/1024/768/390, accordion keyboard, 3D scene pinned on laptop / static image on phone, English content |
| Inner pages | 12 pages × (one h1, no overflow at 390, axe 0 serious) incl. EN/IT/DE URLs |
| Projects | filters in the URL, Back undoes a filter, filtered URL opens filtered |
| i18n | language switcher maps document slugs; foreign slug redirects; IT/DE CMS content; message files have identical keys |
| Lightbox | open, arrows, Esc, focus returns |
| Factory | horizontal pinned process on laptop, list on phone, `#certifikata` |
| Forms | quote (2 steps, inline errors, upload, success), tender (`?forma=tender`, wrong file type refused), job application (CV required) — each creates a real lead in Sanity (removed with `npm run test:cleanup-leads`) |
| Motion | intro once on Home + skip; reduced motion: no intro, nothing hidden |

## 2. Lighthouse (production build, local machine — scores vary ±10 between runs)

| Page | Mobile perf | Desktop perf | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|
| Home | 66 | 92 | 100 | 96* | 92* |
| Projects | 80 | 97 | 98 | 96* | 92* |
| Project detail | 79–86 | 87–98 | 100 | 96* | 92* |
| Contact | 44–68 | 99 | 99 | 92* | 92* |

CLS 0 everywhere. Desktop LCP 0.8–1.5s.
\* The remaining points are local-only: canonical URLs point to the configured site URL (not the test port) and `/_vercel/insights` exists only on Vercel. Both pass on the deployment.

**Mobile performance is below the 90 budget** (conflict C8 in DECISIONS.md): Lighthouse simulates a 4× slower CPU, and the Next.js 16 + React 19 runtime plus the motion stack cost most of it; on Home the spec'd first-visit intro alone holds the hero ~2.3s. Fixes already made: intro only on Home, CSS hero entrance, idle-time animation setup (Home mobile TBT 2.9s → 0.36s), priority images, 3D only after scrolling. Real-device numbers will come from Vercel Speed Insights after launch.

## 3. SEO
- Per-page title/description (CMS SEO fields win), canonical, hreflang for sq/en/it/de + x-default
- `sitemap.xml` (96 URLs today), `robots.txt`, JSON-LD (business, breadcrumbs, systems list, projects), OG images per page
- Old WordPress URLs redirect (`/galeria`, `/wp-*`)

## 4. Security
CSP + security headers, Sanity tokens server-only, private `leads` dataset, Turnstile + honeypot + rate limit, upload types/sizes enforced server-side, lead file links accepted only from our storage.

## 5. Known gaps / waiting for the client
Everything marked `[TO CONFIRM]` is listed in **TODO_CLIENT.md**. Main items:
- Stats (9500+ / 16+ / 5), reply time, opening hours, social links, map pin
- Project names, cities, years, galleries (real photos only)
- System specs, series, benefits, FAQs (only from ALUMIL datasheets)
- Privacy policy text
- Italian/German review by a native speaker (Studio badge "Rishiko")
- Accounts/keys: Resend (+ domain), Turnstile, Vercel Blob, new Sanity tokens
