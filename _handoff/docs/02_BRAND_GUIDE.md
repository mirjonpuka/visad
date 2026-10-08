# 02 — Brand Guide & Design Tokens

## 1. Logo
Files in `brand/logo/` (clean vector redraw of the original, same design):

| File | Use |
|---|---|
| `visad-logo-on-dark.svg` | Default. White letters + red swoosh + red "CONSTRUCTION". On dark backgrounds |
| `visad-logo-on-light.svg` | Near-black letters + red swoosh. On light backgrounds |
| `visad-wordmark-on-dark.svg` / `-on-light.svg` | Without "CONSTRUCTION". Use in the navbar (small sizes) |
| `visad-logo-white.svg` / `-black.svg` | One-colour versions (print, watermarks, over photos) |
| `visad-icon.svg`, `favicon.ico`, `png/icon-*.png`, `png/apple-touch-icon.png` | Favicon, PWA icons, social avatar |

Rules:
- Minimum width: wordmark 88px, full logo 140px.
- Clear space around the logo = height of the letter "I".
- Never recolour the swoosh to anything other than Visad Red (or the one-colour versions). Never add shadows, outlines or gradients.
- The navbar uses the **wordmark** at 104px wide (laptop) / 88px (phone).
- The red S-swoosh is the brand's graphic device: it is also used in the intro animation, the page-transition wipe and as a thin line accent (see Motion spec).

## 2. Colour tokens
Use these exact names as CSS variables and in `tailwind.config.ts` (`theme.extend.colors`).

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0A0B0C` | Footer background |
| `ink-900` | `#0E0F11` | Main dark background |
| `ink-800` | `#16181B` | Raised dark surfaces (mega-menu, cards on dark) |
| `ink-700` | `#22252A` | Image placeholders on dark, skeleton base on dark |
| `ink-600` | `#2E3238` | Skeleton shimmer highlight on dark |
| `line-dark` | `rgba(255,255,255,0.12)` | Hairlines on dark |
| `alu-50` | `#F2F2F0` | Main light background ("aluminium white") |
| `alu-100` | `#E4E5E3` | Secondary light band |
| `alu-200` | `#D7DADD` | Image placeholders on light, skeleton base on light |
| `alu-300` | `#C4C8CC` | Skeleton shimmer highlight on light |
| `line-light` | `rgba(0,0,0,0.12)` | Hairlines on light |
| `text-on-dark` | `#F2F3F5` | Primary text on dark |
| `text-on-dark-2` | `#B9BEC5` | Secondary text on dark |
| `text-on-dark-3` | `#8B9199` | Labels / meta on dark (≥12px only) |
| `text-on-light` | `#121315` | Primary text on light |
| `text-on-light-2` | `#4A4F57` | Secondary text on light |
| `text-on-light-3` | `#5E636B` | Labels on light |
| `red-500` (**Visad Red**) | `#F2000D` | Logo, swoosh, large accents, lines, intro, focus ring on dark |
| `red-600` | `#D7000C` | **Button fills with white text** (passes WCAG AA 5.3:1) |
| `red-700` | `#B0000A` | Button hover/pressed |
| `red-text-on-dark` | `#FF4545` | Small red text on dark backgrounds (AA) |
| `whatsapp` | `#25D366` | WhatsApp buttons only, with text `#08231A` (never white text) |

Rules:
- Red is an **accent**: max ~5% of any screen. Never large red backgrounds except the 600ms page-transition wipe and the intro wipe.
- Sections alternate dark (`ink-900`) and light (`alu-50`) as defined in the UI spec.
- All text/background pairs must pass WCAG AA (4.5:1 normal text, 3:1 ≥24px).

## 3. Typography
- **Display + UI font:** `Geist` (Google Fonts, OFL) via `next/font/google`, weights 300/400/500/600.
- **Technical/label font:** `Geist Mono` 400/500, for labels, numbers, eyebrows, specs, photo notes.
- No other fonts.

Type scale (laptop 1440 → phone 390, use `clamp()`):

| Token | Laptop | Phone | Weight | Tracking | Line height | Use |
|---|---|---|---|---|---|---|
| `display-xl` | 112px | 48px | 500 | -0.035em | 0.95 | Hero headline |
| `display-l` | 88px | 44px | 500 | -0.035em | 0.98 | CTA headline |
| `h1` | 72px | 40px | 500 | -0.03em | 1.0 | Page titles (inner pages) |
| `h2` | 56px | 34px | 500 | -0.03em | 1.0 | Section titles |
| `h3` | 30px | 24px | 400 | -0.02em | 1.15 | Accordion rows, card titles large |
| `h4` | 20px | 18px | 500 | -0.01em | 1.3 | Card titles |
| `body-l` | 19px | 17px | 300 | 0 | 1.55 | Lead paragraphs |
| `body` | 16px | 16px | 400 | 0 | 1.6 | Body |
| `body-s` | 14px | 14px | 400 | 0 | 1.55 | Meta, card text |
| `eyebrow` | 12px | 11px | Mono 400 | 0.14em, UPPERCASE | 1.2 | "01 — Sistemet" labels |
| `label` | 11px | 11px | Mono 500 | 0.10em, UPPERCASE | 1.2 | Link labels, tags |
| `stat` | 64px | 44px | 500 | -0.03em | 1 | Numbers |

Albanian characters (ë, ç, Ë, Ç) must render correctly: load the `latin-ext` subset.

## 4. Layout grid
- Container: `max-width: 1440px`, side padding **64px** (laptop ≥1200), **40px** (tablet 768–1199), **20px** (phone <768).
- 12-column grid, gutter 20px (laptop), 16px (phone).
- Vertical section padding: 120px laptop / 96px tablet / 72px phone. Hero and CTA sections: 140px.
- Breakpoints (Tailwind): `sm 480`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1440`. Design is authored for `2xl`, then adapted down.
- Radius: 2px on buttons, cards, images (sharp, engineered look). Only circles are round (icon buttons, WhatsApp FAB).
- Hairlines (1px `line-dark`/`line-light`) are used instead of boxes/shadows to separate content. No drop shadows except the WhatsApp FAB and the mega-menu.

## 5. Imagery rules
- **Project pages and project tiles: real Visad photos only.** Never stock or AI images there.
- Atmosphere slots (hero, systems, solutions, careers) may use temporary stock/AI images until the professional shoot; they are flagged `isPlaceholder: true` in the CMS.
- Colour grade: neutral-cool, slightly lifted shadows, no heavy saturation; verticals straight on buildings.
- Every image has: alt text in all 4 languages, a focal point (Sanity hotspot), and an LQIP blur.
- Empty image slots render a placeholder block (`ink-700` on dark / `alu-200` on light) with a **tiny note centred at the bottom** (Mono 10px, uppercase) saying which photo belongs there. The note shows in development and preview, and in production only if the slot is still a placeholder.

## 6. Iconography
- Stroke icons, 1.5px stroke, 24px grid (use `lucide-react`). Arrows in links are the text arrow "→".
- No emoji anywhere.

## 7. Voice & tone
- Short, confident, technical sentences. No hype words ("the best in the market", "extraordinary").
- Speak to the reader as "ju" (formal you) in Albanian.
- Numbers and facts over adjectives.
