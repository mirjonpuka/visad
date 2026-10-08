# 03 — UI / UX Specification (detailed)

Read `02_BRAND_GUIDE.md` (tokens) and `04_MOTION_SPEC.md` (all animation timings) together with this file.
Every measurement below is for **laptop 1440px** first, then tablet (768–1199) and phone (<768).
Words in `code` are component names or tokens to use exactly.

---

## 0. UX principles (apply everywhere)
1. **Laptop first, phone excellent.** Author at 1440, then adapt. Nothing may overflow horizontally at 360px.
2. **One primary action per screen:** "Kërko ofertë" (request quote) or WhatsApp. The quote button is always visible in the navbar; the WhatsApp button is always visible bottom-right.
3. **Show, don't tell:** photos and real numbers before paragraphs. Paragraphs max 3 lines on laptop (max-width 560px).
4. **Two depths of information:** homeowners get simple language and photos; architects get specs, PDFs and details one click deeper ("Fleta teknike", "Detaje teknike" sections).
5. **Never a blank or jumping screen:** every async piece of UI has a skeleton of the exact final size (§11). Images reserve their aspect ratio. CLS must be < 0.05.
6. **Accessible:** real `<button>`/`<a>`, visible focus ring (2px `red-500`, 2px offset), all interactions usable by keyboard, `prefers-reduced-motion` respected, touch targets ≥ 44px.
7. **Language:** Albanian default at `/`, others at `/en`, `/it`, `/de`. Switching language keeps the user on the same page (equivalent localized URL).

---

## 1. Sitemap & routes
| Page | AL route (default) | EN route | Template |
|---|---|---|---|
| Home | `/` | `/en` | Home |
| Systems index | `/sistemet` | `/en/systems` | SystemsIndex |
| System detail (×6) | `/sistemet/[slug]` | `/en/systems/[slug]` | SystemDetail |
| Projects index | `/projektet` | `/en/projects` | ProjectsIndex |
| Project detail | `/projektet/[slug]` | `/en/projects/[slug]` | ProjectDetail |
| Factory / About | `/fabrika` | `/en/factory` | Factory |
| Solutions (×4) | `/zgjidhje/[segment]` | `/en/solutions/[segment]` | Solution |
| Careers | `/karriera` | `/en/careers` | Careers |
| Job detail | `/karriera/[slug]` | `/en/careers/[slug]` | JobDetail |
| Contact & quote | `/kontakt` | `/en/contact` | Contact |
| Privacy | `/privatesia` | `/en/privacy` | Legal |
| 404 | — | — | NotFound |

IT and DE use their own translated pathnames (`/it/sistemi`, `/de/systeme`, etc., see `06_ARCHITECTURE.md`).

Systems (6): Dyer (doors) · Dritare (windows) · Sisteme rrëshqitëse (sliding) · Grila (shutters) · Ballkone & parmakë (balconies & railings, incl. stair railings) · Fasada (façades).
Solutions (4): Pronarë shtëpish (homeowners) · Zhvillues & ndërtues (developers) · Hotele & turizëm (hotels) · Arkitektë & tendera (architects & tenders).

---

## 2. Global components

### 2.1 `Navbar`
**Laptop:** height 76px, `position: fixed`, top 0, full width, z-index 50.
- Background: over the hero it is transparent with white content; after scrolling 40px it becomes `rgba(14,15,17,0.88)` + `backdrop-filter: blur(12px)` + bottom hairline `line-dark` (transition 300ms).
- On light pages/sections the navbar stays dark (consistent).
- **Hide on scroll down, show on scroll up** (after 400px scrolled; translateY(-100%) 400ms `ease-out-expo`). Always visible when the mega-menu is open or when focus is inside it.
- Layout (container, flex, space-between, align center):
  - Left: wordmark logo (104px wide) + 1px vertical divider (28px tall) + eyebrow text "Sisteme alumini · Shkodër" (`label`, `text-on-dark-3`). Logo links to `/`.
  - Centre: links `Sistemet ▾`, `Projektet`, `Fabrika`, `Zgjidhje ▾`, `Karriera`, `Kontakt` (`body-s` 14px, `text-on-dark-2`, gap 32px). Active page: `text-on-dark` + 1px red underline 6px below. Hover: animated underline (§ Motion 5.3).
  - Right: language switcher `AL EN IT DE` (Mono 11px, active = white, others `text-on-dark-3`, gap 10px), then primary button "Kërko ofertë" (`ButtonPrimary` size md).
- **Tablet & phone (<1024):** centre links and eyebrow hidden. Right side: "Kërko ofertë" (compact: "Ofertë" under 400px) + menu button (44×44, hairline border, hamburger icon that morphs into ×).

### 2.2 `MegaMenu` (Sistemet ▾ and Zgjidhje ▾)
- Opens on hover (with 120ms intent delay) and on click/Enter/Space; closes on mouse leave (250ms grace), Esc, or click outside.
- Panel: full width under the navbar, background `ink-800`, bottom hairline, shadow `0 24px 48px rgba(0,0,0,.35)`, height auto (~360px).
- **Sistemet panel content:** left column (3/12): title "Sistemet" (h4) + one line intro + link "Të gjitha sistemet →". Right (9/12): 6 items in a 3×2 grid. Each item: thumbnail 16:10 (system image) + name (h4) + one-line description (`body-s`, `text-on-dark-2`). Hover: thumbnail zooms to 1.04, name gets a red 1px underline.
- **Zgjidhje panel:** same but 4 items in a 4×1 grid.
- Background page behind the menu dims with `rgba(0,0,0,.4)` overlay (fade 250ms).
- Accessibility: trigger is a `<button aria-expanded aria-controls>`; items are links; focus is trapped while open; Esc returns focus to the trigger.

### 2.3 `MobileMenu` (<1024)
- Full-screen overlay, `ink-900`, slides down from top with the clip-path reveal (§ Motion 6.4).
- Content: big links (h3 size, 32px) stacked with hairlines between them, each with a small number "01–06" in Mono. "Sistemet" and "Zgjidhje" expand as accordions to show their sub-items.
- Bottom area: language switcher (large, 44px targets), phone numbers (tap to call), WhatsApp button full width.
- Body scroll locked while open. Esc and the × button close it.

### 2.4 `Footer`
- Background `ink-950`, top hairline, padding 72px top / 40px bottom.
- Top row: big line "Keni një projekt?" (h2) on the left + `ButtonWhatsApp` and `ButtonSecondary` "Formulari i ofertës" on the right (only on pages that do not already end with the CTA section; on Home the CTA section is above the footer, so the footer omits this row).
- 4-column grid (laptop), 2 columns (tablet), 1 column (phone):
  1. Logo (on-dark, 140px) + "Sisteme alumini dhe PVC. Prodhim dhe montim në Shkodër." + ALUMIL partner badge (small).
  2. "Sistemet": the 6 system links.
  3. "Kompania": Projektet, Fabrika, Zgjidhje, Karriera, Kontakt, Privatësia.
  4. "Kontakt": address (link to Google Maps), both phones (`tel:`), email (`mailto:`), opening hours (from CMS), social icons (Facebook, Instagram from CMS).
- Bottom bar: "© {year} VISAD Construction" left; language switcher right; hairline above.
- Column titles: `eyebrow` style.

### 2.5 `WhatsAppFab`
- Fixed bottom-right, 24px from the edges (16px on phone), 56×56 circle, `whatsapp` green, icon `#08231A`, shadow `0 8px 24px rgba(0,0,0,.35)`.
- Link: `https://wa.me/355673772989?text=<prefilled, localized, includes current page title>`. Number comes from CMS `siteSettings`.
- On laptop, hovering expands it into a pill with text "Na shkruani në WhatsApp" (width animates 56 → ~250px, 350ms).
- Appears after the intro finishes (scale 0.6→1 + fade, 400ms). Hidden while the mobile menu is open. On the Contact page it stays.
- Must not cover the cookie banner: when the banner is visible, the FAB moves up by the banner height.

### 2.6 Buttons
| Component | Style | Sizes |
|---|---|---|
| `ButtonPrimary` | bg `red-600`, text white, weight 500, radius 2px. Hover: bg `red-700` + arrow moves 4px right. Pressed: scale .98 | md: 44px tall, 18px x-padding, 14px text · lg: 54px tall, 26px x-padding, 15px text |
| `ButtonSecondary` | 1px border `rgba(255,255,255,.35)` (on dark) / `#121315` (on light), transparent bg. Hover: fill slides in from the left (white on dark / ink on light) and the text inverts | md / lg |
| `ButtonWhatsApp` | bg `whatsapp`, text `#08231A`, weight 600, chat icon left | lg |
| `LinkArrow` | text + "→", 1px underline 4px below. Hover: underline redraws left to right, arrow shifts 4px | — |
| `IconButton` | 40/44px circle, 1px border, icon centred | — |

Large buttons (lg) are **magnetic** on laptop (§ Motion 5.2). Disabled: 40% opacity, no hover. Loading: label fades out, a 16px spinner fades in, width stays fixed.

### 2.7 `SectionHeader`
Pattern used by every section: eyebrow (`"01 — Sistemet"`, numbered per page) + h2 on the left; optional intro paragraph or `LinkArrow` aligned bottom-right. Bottom margin 56px. On phone, stacked with 24px gap.

### 2.8 `CMSImage`
One component for every image: wraps `next/image`, uses the Sanity image URL builder with `auto=format` (WebP/AVIF), correct `sizes`, LQIP blur placeholder, hotspot crop, and shows the `ImageSkeleton` until loaded. If the slot has no image → `PlaceholderImage` with the bottom-centre note (see §11.3).

### 2.9 `CookieBanner`
Bottom-left card (max-width 420px), `ink-800`, text + "Prano" (primary) + "Vetëm të domosdoshmet" (secondary). Analytics load only after consent. Remembers choice for 12 months.

### 2.10 `Breadcrumbs`
On inner pages under the page title: `Kryefaqja / Sistemet / Dritare` in Mono 11px, `text-on-dark-3`. Also output as JSON-LD BreadcrumbList.

---

## 3. HOME (`/`)
Order of sections (background in brackets). Section numbers in eyebrows: 01–05.

### 3.0 Intro (first visit only)
See Motion spec §2. Overlay above everything; the hero is already rendered underneath (so LCP is not delayed). Skip on any key press, click or scroll.

### 3.1 Hero [dark, full-bleed image]
- Height: `100svh`, min 720px, max 980px. Phone: `100svh`, min 600px.
- Background: `CMSImage` cover with focal point (slot `home-hero`). Overlay gradient: transparent at 45% → `rgba(14,15,17,.75)` at bottom (for text contrast). Optional: CMS can set a muted looping video (MP4/WebM ≤ 4MB, poster = the image) instead of the image.
- Content bottom-left in the container, padding-bottom 96px (phone 56px):
  1. Eyebrow: "Partner i certifikuar ALUMIL · Shkodër" (Mono 12px, `text-on-dark-2`).
  2. Headline `display-xl`: "Precizion në<br>çdo profil." (max-width 1000px).
  3. Lead `body-l` (max 560px): "Dyer, dritare dhe fasada alumini, të prodhuara në fabrikën tonë në Shkodër dhe të montuara nga ekipi ynë."
  4. Buttons (gap 12px): `ButtonPrimary lg` "Kërko ofertë →" (→ `/kontakt`) + `ButtonSecondary lg` "Shiko projektet" (→ `/projektet`).
- Bottom-right (laptop only): scroll indicator: Mono label "SCROLL" + a 1px × 48px line with a red segment travelling down in a loop (2s).
- Motion: headline lines reveal (mask up), image does a slow scale 1.08 → 1.0 over 1.6s on load; parallax on scroll (image moves at 0.85× speed and darkens slightly).
- Phone: headline 48px, buttons full width stacked.

### 3.2 Stats band [dark]
- 3 columns separated by vertical hairlines (laptop), padding 56px vertical. Phone: stacked with horizontal hairlines.
- Each: number `stat` + label `body-s` `text-on-dark-2`.
  - "9500+" — "projekte të realizuara"
  - "16+" — "vite përvojë"
  - "5" — "shtete me klientë"
- Values come from CMS (`siteSettings.stats`). Motion: count-up when in view (§ Motion 4.6).

### 3.3 Systems — 3D profile story + accordion [dark] (`id="sistemet"`)
Two parts inside one section:

**A) 3D profile story (laptop & capable devices):** a pinned scroll scene, ~250vh of scroll length.
- Left (5/12): eyebrow "01 — Sistemet", h2 "Inxhinieri në çdo milimetër.", then the 5 text steps that change with scroll progress (see `05_3D_PROFILE_SPEC.md`): 1. Profili i aluminit · 2. Ura termike · 3. Guarnicionet EPDM · 4. Xhami dyfish/trefish · 5. I montuar, i testuar. Each step: Mono number, h4 title, one line text. Active step: full white; inactive: 35% opacity. A thin vertical progress line (red fill) runs next to the steps.
- Right (7/12): the WebGL canvas with the profile cross-section that rotates and explodes, then reassembles.
- Phone / low-power / reduced motion: no pinning. Show a static high-quality render image (`brand/3d/profile-exploded.webp` exported from the same scene) and the 5 steps as a simple list.

**B) Systems accordion (Vitrocsa-style):** directly after the 3D story.
- `SectionHeader`: h2 "Sisteme për çdo hapje." + `LinkArrow` "Të gjitha sistemet →".
- Laptop: 2 columns, gap 64px. Left 46%: the accordion. Right: one large image (min-height 620px, radius 2px) showing the open system; top-left overlay label Mono "01 / 06 · Dyer".
- Accordion row: top hairline; button full width, padding 26px 0; Mono number (12px) + name (h3 30px) + circle icon button 40px with "+" (closed) / "–" (open).
- Open row content (padding-left 52px, bottom 32px): description (body, `text-on-dark-2`, max 460px) + links in Mono: "Shiko detajet →" (to system page) and "Fleta teknike (PDF)" (if PDF exists).
- Only one row open at a time; first row open by default. Opening a row: height animates, text fades up, image on the right crossfades + slight scale (Motion 4.5).
- Phone: accordion only; the image appears **inside** the open row (16:10, above the text).
- Keyboard: rows are buttons with `aria-expanded`; arrow up/down moves between rows.

### 3.4 Featured projects [light `alu-50`] (`id="projektet"`)
- `SectionHeader`: eyebrow "02 — Projektet", h2 "Projekte të zgjedhura.", right: intro paragraph (max 420px) "Nga vila private te hotele dhe ndërtesa banimi, punë të realizuara nga ekipi ynë në Shqipëri dhe në rajon."
- **Asymmetric editorial grid** (12 cols, gap 20px, row unit 290px):
  - Tile 1: cols 1–7, 2 rows (large)
  - Tile 2: cols 8–12, 1 row
  - Tile 3: cols 8–12, 1 row
  - Tile 4: cols 1–5, 2 rows
  - Tile 5: cols 6–12, 2 rows
- Source: the 5 projects with `featured = true` in CMS ordered by `featuredOrder`.
- `ProjectTile`: full-bleed image; overlay at bottom with gradient (transparent → `rgba(14,15,17,.7)`); bottom-left: project name (h4, white) + meta "Qyteti · Sistemi · Viti" (body-s, `text-on-dark-2`); top-right: Mono number "01". Hover (laptop): image scale 1.04 (700ms), overlay darkens, a "Shiko projektin →" label slides up 12px into view, custom cursor becomes "Shiko" (Motion 5.4).
- Under the grid, centred: `ButtonSecondary lg` (on light) "Të gjitha projektet →".
- Tablet: 2 columns, all tiles equal height 360px, tile 1 spans both columns. Phone: 1 column, 320px tall each.
- Motion: tiles reveal with image wipe (clip-path) staggered 80ms.

### 3.5 Factory teaser [dark] (`id="fabrika"`)
- Laptop: 2 columns (40% / 60%), gap 64px.
- Left: eyebrow "03 — Fabrika", h2 "Nga profili<br>te montimi.", paragraph "Çdo dritare dhe derë prodhohet në fabrikën tonë në Shkodër. Kontrollojmë çdo hap, që cilësia të mos varet nga askush tjetër.", then a 3-step list with hairlines: `01 Matje & projektim`, `02 Prodhim në fabrikë`, `03 Instalim & garanci` (Mono number in `red-text-on-dark`, h4 title, body-s description). Then `LinkArrow` "Njihuni me fabrikën →".
- Right: image grid: 1 wide image on top (420px tall, slot `factory-1` = HQ exterior), 2 below (260px, slots `factory-2` truck/delivery, `factory-3` installation).
- Motion: images parallax at different speeds (0.9 / 1.05), steps reveal one by one.
- Phone: stacked, images become a horizontal swipe carousel (scroll-snap) with 85% width cards.

### 3.6 Solutions by client [light] (`id="zgjidhje"`)
- eyebrow "04 — Zgjidhje", h2 "Për kë punojmë."
- 4 cards in a row (laptop), 2×2 (tablet), 1 column (phone).
- `SolutionCard`: image 4:5 + title (h4) + one line (body-s) + `LinkArrow` "Mëso më shumë →". Hover: image zoom 1.04 + card lifts 4px; the arrow moves.
- Cards: Pronarë shtëpish · Zhvillues & ndërtues · Hotele & turizëm · Arkitektë & tendera.

### 3.7 ALUMIL partner band [light `alu-100`]
- Padding 72px. Row: ALUMIL partner logo (260×120 box) · text block (h3 "Partner i certifikuar i ALUMIL" + one paragraph) · `LinkArrow` "Certifikatat →" (to Factory page #certifikata).
- Motion: subtle; logo fades in, a thin red line draws under the heading.

### 3.8 CTA [dark] (`id="kontakt"`)
- Padding 140px. Left: `display-l` "Keni një projekt?" + lead "Na shkruani në WhatsApp me disa foto dhe masa. Ju përgjigjemi brenda ditës." Right (aligned bottom): `ButtonWhatsApp` "Shkruani në WhatsApp" + `ButtonSecondary lg` "Formulari i ofertës".
- Background detail: the red swoosh drawn as a huge thin line (1px stroke, 20% opacity) across the section, drawing itself as the section scrolls in.

### 3.9 Footer (see 2.4)

---

## 4. SYSTEMS INDEX (`/sistemet`)
1. **Page hero [dark]:** height 70vh (min 560). Eyebrow "Sistemet", h1 "Sisteme alumini dhe PVC, të prodhuara në Shkodër." Breadcrumbs. Background image (slot `systems-hero`) with dark overlay.
2. **Intro row [dark]:** 2 columns: paragraph about ALUMIL systems + 3 key specs in Mono (e.g. "Uf deri në 1.0 W/m²K" etc. — only values confirmed by the ALUMIL datasheets; otherwise leave the spec block out).
3. **Systems list [light]:** 6 large rows (Sky-Frame/IQ Glass style). Each row: full container width, 2 columns alternating image left/right; image 16:10 (7/12), text (5/12): Mono "01", h2 name, description, 3 bullet features (with hairlines), `ButtonSecondary` "Shiko sistemin →". Rows separated by 120px.
4. **Downloads strip [dark]:** "Fleta teknike & katalogë" list of PDFs (name, size, language, download icon).
5. **CTA** (as Home 3.8) + Footer.

## 5. SYSTEM DETAIL (`/sistemet/[slug]`)
1. **Hero [dark]:** split: left text (breadcrumbs, eyebrow = category, h1 = system name, lead, buttons "Kërko ofertë" + "Fleta teknike (PDF)"), right image 4:5 (laptop). Phone: image on top.
2. **Sticky sub-nav** (appears after hero): anchors "Përmbledhje · Seritë · Detaje teknike · Projekte · Pyetje". Active anchor underlined in red. Height 52px, `ink-800`.
3. **Overview [light]:** 2 columns: rich text + key benefits list (icon + title + text, 4 items).
4. **Series [light]:** cards for each ALUMIL series offered in this system (CMS `systemSeries`): image, series name (e.g. "ALUMIL SMARTIA M…"), 3 specs in Mono (e.g. sightline, Uw, max sash weight), "Fleta teknike" link. Grid 3 columns.
5. **Technical details [dark]:** spec table (2 columns: property / value), hairline rows, Mono values. Below: optional cross-section drawing (SVG/PNG) and, if available, the 3D viewer of that profile (drag to rotate, phase 2).
6. **Colours & finishes [light]:** swatch grid (RAL colours + anodised, wood-effect) from CMS: 48px squares + name + code.
7. **Related projects [light]:** 3 `ProjectTile`s using this system (query by reference). "Të gjitha projektet me këtë sistem →" links to `/projektet?sistemi=slug`.
8. **FAQ [light]:** accordion (same component style as Home systems accordion, smaller: h4 rows).
9. **CTA** + Footer.

## 6. PROJECTS INDEX (`/projektet`)
1. **Header [light]:** h1 "Projektet" + count "34 projekte" (Mono) + intro.
2. **Filter bar (sticky under navbar, `alu-50`, hairline bottom):**
   - Chips groups: **Lloji** (Banim, Vila, Hotel, Komercial, Publik), **Sistemi** (6 systems), **Qyteti** (dropdown of cities in CMS).
   - Chip: 36px tall (44px touch area), 1px border, active = ink background + white text. Multiple chips per group allowed (OR within group, AND between groups).
   - "Pastro filtrat" link appears when any filter is active.
   - Filters are stored in the URL query (`?lloji=hotel&sistemi=dritare`) so links are shareable and the back button works.
   - Phone: filter bar collapses into a "Filtro (2)" button opening a bottom sheet with the same groups + "Shfaq 12 projekte" button.
3. **Grid:** asymmetric editorial rhythm repeated: pattern of 5 tiles (same as Home 3.4), then repeat. When filters reduce results below 5, switch to a regular 2-column grid. Filtering animates with FLIP (Motion 4.7). Results update instantly (client-side filtering of the pre-fetched list, ≤ 200 projects).
4. **Load more:** first 15 tiles, then "Shfaq më shumë" button (+15). Skeleton tiles show while loading (§11).
5. **Empty state:** "Asnjë projekt me këto filtra." + `LinkArrow` "Pastro filtrat".
6. CTA + Footer.

## 7. PROJECT DETAIL (`/projektet/[slug]`)
1. **Hero:** full-bleed cover image (90vh) with title bottom-left (h1) + meta row in Mono: Qyteti · Viti · Lloji. Breadcrumbs above title.
2. **Facts bar [dark]:** 5 cells with hairlines (ALCA-style data, but cleaner): Klienti · Kategoria · Sipërfaqja (m²) · Sistemet (linked chips) · Viti. Hide any empty cell.
3. **Story [light]:** 2 columns: left sticky h3 "Sfida & zgjidhja", right rich text (max 640px).
4. **Gallery [light]:** masonry-like editorial layout from the CMS gallery (alternating full-width image, 2-up, 3-up). Click opens the `Lightbox` (full screen, `ink-950` background, arrows, swipe, Esc to close, counter "3 / 12" in Mono, captions). Images lazy-load with skeletons.
5. **Before/after (phase 2):** `BeforeAfterSlider` component placeholder in the schema already.
6. **Systems used [dark]:** cards linking to system pages.
7. **Next project:** full-width band with the next project's image darkened and its name huge (h1); hover reveals the image more; click = page transition.
8. CTA + Footer.

## 8. FACTORY / ABOUT (`/fabrika`)
1. **Hero:** video or image of the factory (slot `factory-hero`), h1 "Fabrika jonë në Shkodër."
2. **Numbers [dark]:** 4 stats (projects, years, countries, + one more from CMS, e.g. m² of factory or team size — only real values).
3. **Process [light]:** horizontal scroll section on laptop (pinned, 4–5 panels): Matje → Projektim → Prerje CNC → Montim → Instalim. Each panel: big Mono number, h3, text, image. Phone: vertical list.
4. **Machinery [dark]:** grid of machine photos with captions.
5. **Certificates [light]** (`id="certifikata"`): ALUMIL partner certificate + CE/ISO if they exist; each as a card with a thumbnail and "Shkarko PDF".
6. **Team [light]:** optional grid (photo, name, role) — hidden if empty.
7. **Map & visit [dark]:** embedded map (static image map with a click-to-load interactive map for performance and privacy), address, hours, "Merrni drejtimet →".
8. CTA + Footer.

## 9. SOLUTION PAGES (`/zgjidhje/[segment]`)
Same template for the 4 audiences, content from CMS:
1. Hero (image + h1 tailored, e.g. "Për hotelet: pamje të hapura, sisteme që zgjasin.").
2. "Çfarë ju ofrojmë" — 3–4 benefit blocks.
3. Recommended systems (cards).
4. Relevant projects (filtered by type).
5. Segment-specific CTA: homeowners → WhatsApp first; developers & hotels → quote form; architects & tenders → tender form + downloads list.
6. Footer.

## 10. CAREERS (`/karriera`, `/karriera/[slug]`)
- Hero (installation photo), intro "Punoni me ne".
- Benefits row (4 icons + text).
- Job list: rows with title (h4), type (Mono tag: "Me kohë të plotë"), location, `LinkArrow`. Empty state: "Aktualisht nuk ka pozicione të hapura. Na dërgoni CV-në tuaj." + general application form.
- Job detail: description (rich text) + application form (name, phone, email, CV upload PDF ≤ 5MB, message, consent).

## 11. CONTACT & QUOTE (`/kontakt`)
1. **Header [dark]:** h1 "Kontakt", lead, and 3 quick-contact cards in a row: WhatsApp (primary, green accent), Telefon (both numbers), Email. Each card is a large tappable link.
2. **Forms [light]:** tabs (`role="tablist"`): **"Kërko ofertë"** (default) and **"Tender / B2B"**. The tab can be preselected via `?forma=tender`.
   - **Quote form (homeowners), 2-step:**
     - Step 1 "Çfarë ju nevojitet?": system type (multi-select chips: Dyer, Dritare, Rrëshqitëse, Grila, Ballkone/parmakë, Fasada), project type (Shtëpi e re / Rinovim / Pallat / Biznes), number of openings (stepper), approximate dimensions (optional textarea), city.
     - Step 2 "Kontakti": name*, phone* (with +355 default, international allowed), email, preferred contact (WhatsApp / telefon / email), photos upload (up to 6 images, ≤ 10MB each, drag & drop + camera on phone), message, GDPR consent checkbox*.
     - Progress indicator "1 / 2" with a red progress line. "Vazhdo →" / "← Kthehu" / "Dërgo kërkesën".
   - **Tender / B2B form:** company*, contact person*, role, phone*, email*, project name, location, project stage (Projektim / Tender / Ndërtim), estimated area m², deadline date, documents upload (PDF/DWG/ZIP, up to 5 files, ≤ 25MB each), message, consent*.
   - Validation: inline, on blur, messages under the field in `red-text` with an icon; never only colour. Submit button shows loading state; on success the form is replaced by a success panel ("Faleminderit! Do t'ju kontaktojmë brenda 24 orësh." + WhatsApp button + "Kthehu te kryefaqja"). On error: inline banner with retry; the form keeps the user's data.
   - Spam protection: Cloudflare Turnstile (invisible) + honeypot field.
3. **Map & address [dark]** (as Factory 8.7) + opening hours.
4. Footer (without the CTA row).

## 12. 404 & Legal
- 404: dark, huge Mono "404", h2 "Kjo faqe nuk u gjet.", links to Home, Projektet, Kontakt. The swoosh line animates across.
- Privacy: simple light page, rich text, max-width 720px.

---

## 13. Loading, skeletons & empty states (required everywhere)

### 13.1 Route loading
- Each route segment has a `loading.tsx` that renders the **page skeleton** with the same layout as the real page (hero block, title bars, grid of tiles), so the transition never shows a blank screen.
- Skeletons are only shown if loading takes > 150ms (avoid flashes).

### 13.2 `Skeleton` component
- Base colour: `ink-700` on dark sections, `alu-200` on light sections. Shimmer: a diagonal highlight (`ink-600` / `alu-300`) sweeping left→right, 1.4s linear infinite. With `prefers-reduced-motion`: no shimmer, static base colour.
- Variants: `SkeletonText` (lines of 12/16px height with 70–95% random widths, radius 2px), `SkeletonTitle`, `SkeletonImage` (keeps aspect ratio), `SkeletonTile` (project tile), `SkeletonCard` (solution/series card), `SkeletonRow` (job/download row).
- Exact sizes must match the final components so nothing moves when content arrives (crossfade 250ms skeleton → content).

### 13.3 Images
- Every image reserves its box (aspect ratio or fixed height), shows the LQIP blur (from Sanity) under a skeleton shimmer, then fades in (opacity 0→1, 500ms) when decoded.
- `PlaceholderImage` for missing images: flat `ink-700`/`alu-200` box + note centred at the bottom: Mono 10px, uppercase, 0.04em tracking, padding 4px 8px, radius 3px, background `rgba(255,255,255,.07)` (dark) / `rgba(0,0,0,.06)` (light), colour `#B9BEC5` / `#41464E`, max-width 88%, centred text. Text example: "PHOTO: wide shot of the Visad factory floor with machines".

### 13.4 Forms
- Upload fields show per-file progress bars and thumbnails; failed uploads can be retried individually.

---

## 14. Responsive rules summary
| Element | Laptop (≥1200) | Tablet (768–1199) | Phone (<768) |
|---|---|---|---|
| Container padding | 64px | 40px | 20px |
| Navbar | full links | logo + quote + menu | logo + quote (compact) + menu |
| Hero headline | 112px | 80px | 48px |
| Section padding | 120px | 96px | 72px |
| Project grid | asymmetric 12-col | 2 cols | 1 col |
| Systems | 3D pinned + accordion with side image | 3D pinned (if capable) + accordion with side image | static 3D image + accordion with inline image |
| Solution cards | 4 cols | 2 cols | 1 col |
| Footer | 4 cols | 2 cols | 1 col |
| Custom cursor | on | off | off |
| Magnetic buttons | on | off | off |
| Smooth scroll (Lenis) | on | on | off (native scroll) |

## 15. Accessibility checklist (must pass)
- Lighthouse Accessibility ≥ 95, axe: 0 serious issues.
- Skip link "Kalo te përmbajtja" as first focusable element.
- Headings in order (one h1 per page).
- All images with localized `alt`; decorative ones `alt=""`.
- Colour contrast AA everywhere (see tokens).
- Focus visible; focus never hidden behind the sticky navbar (`scroll-margin-top: 96px` on anchors).
- Motion: everything respects `prefers-reduced-motion` (see Motion spec §9). The intro is skipped completely.
- Forms: labels, `aria-describedby` for errors, `aria-live="polite"` for submit result.
- `lang` attribute set per locale (`sq`, `en`, `it`, `de`).
