# 04 — Motion Specification ("Cinematic everywhere")

Goal: the site should feel as smooth as sky-frame.com and as precise as a machined aluminium profile. Motion is **fast, controlled, never bouncy**. Everything runs at 60fps on a mid-range laptop and stays light on phones.

## 1. Libraries & global setup
| Need | Library |
|---|---|
| Smooth scroll | `lenis` (laptop/tablet only; disabled on touch-only phones and with reduced motion) |
| Scroll-driven timelines, pinning, text splitting | `gsap` + `ScrollTrigger` + `SplitText` (GSAP is free incl. plugins) |
| Component/UI animations (menus, accordion, tabs, FLIP, page transitions) | `motion` (Framer Motion, `motion/react`) |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` (see 3D spec) |

- Lenis is connected to GSAP's ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`). Lenis options: `lerp: 0.1`, `wheelMultiplier: 1`, `smoothWheel: true`.
- Animate only `transform`, `opacity`, `clip-path` and `filter` (small radius). Never animate `width/height/top/left` except the accordion height (use Motion `layout`/`height:auto`).
- Put all motion code in client components under `components/motion/`; pages stay server components.
- One `MotionProvider` exposes `reducedMotion`, `isTouch`, `isLowPower` (from `navigator.hardwareConcurrency <= 4` or `deviceMemory <= 4` or `saveData`).

### Easing & duration tokens
| Token | Value | Use |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveals, entrances |
| `ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Wipes, page transitions, swoosh draw |
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hovers, colour changes |
| `dur-xs` 150ms · `dur-s` 250ms · `dur-m` 400ms · `dur-l` 700ms · `dur-xl` 1100ms | | |

## 2. Logo intro (first visit only)
Reference implementation: `brand/intro/logo-intro-demo.html` (open it in a browser, it works). Port it to a React client component `IntroOverlay`.

Timeline (total ≈ 2.3s, then hero entrance):
| t (s) | What happens |
|---|---|
| 0.00 | Full-screen `ink-900` overlay with the logo SVG centred (width min(520px, 72vw)). Nothing visible yet |
| 0.15 → 1.05 | The red S-swoosh **draws itself** left→right (`stroke-dashoffset` 1→0 with `pathLength="1"`), `ease-in-out-quart` |
| 0.55 → 1.45 | Letters V, I, A, D rise from a mask (translateY 110% → 0), stagger 70ms, 700ms each, `ease-out-expo` |
| 1.10 → 1.60 | "CONSTRUCTION" fades in |
| 1.75 → 2.85 | A red (`red-500`) panel wipes up from the bottom to cover the screen (0→45% of the time), then continues up and off, revealing the hero |
| 2.30 | Overlay hidden (`visibility: hidden`), removed from DOM after the wipe |
| 2.45 → 3.35 | Hero entrance: headline lines rise, eyebrow & buttons fade up (stagger 80ms), hero image scale 1.08 → 1 |

Rules:
- Show only if `localStorage['visad-intro-seen']` is not set (wrap in try/catch); set it after playing. On later visits: skip the overlay, run only the hero entrance (shortened to 0.7s).
- Skippable: any click, key press, wheel or touch → jump to the wipe immediately.
- The hero HTML is server-rendered underneath, so LCP is not blocked. The overlay is rendered by an inline script check before hydration to avoid a flash of the hero on first visits (set `data-intro="play"` on `<html>` from a tiny inline script in `<head>`).
- Reduced motion: no intro at all.

## 3. Page transitions (every route change)
Use a `TransitionProvider` around `{children}` in the locale layout, intercepting internal `<Link>` clicks (custom `TransitionLink` component).
1. **Leave (450ms):** a `ink-900` panel with a 2px red top edge slides up from the bottom covering the screen (`translateY(100%→0)`, `ease-in-out-quart`). At the same time the current page content moves up 40px and fades to 0.6.
2. **Navigate** (router.push) while covered. The panel shows the destination page name centred (h2, white, reveals with mask) — the name is taken from the link's `data-title`.
3. **Enter (550ms):** panel continues up and off (`translateY(0→-100%)`); new page hero runs its entrance animation (headline reveal).
- Scroll is reset to top while covered (Lenis `scrollTo(0, {immediate:true})`).
- Back/forward navigation: use a shorter crossfade (250ms) instead of the panel.
- If the route takes longer than the leave animation, the panel waits and the route skeleton is shown under it; the panel lifts when the page is ready.
- Reduced motion: simple 150ms crossfade.

## 4. Scroll animations
Default trigger: element top reaches 85% of the viewport; play once.

### 4.1 Headline reveal (all h1/h2/display text)
Split into lines (SplitText `type: "lines"`, `mask: "lines"`). Each line: translateY 100% → 0, 900ms `ease-out-expo`, stagger 90ms. Re-split on resize (debounced).

### 4.2 Paragraph / small content
Fade + rise: opacity 0→1, translateY 24px→0, 700ms, stagger 60ms for sibling groups.

### 4.3 Image reveal (wipe)
Images in content: `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` 1100ms `ease-in-out-quart`, image inside scales 1.15 → 1.0 at the same time. Grids stagger 80ms.

### 4.4 Parallax
Hero and large images: background moves at 0.85× (`yPercent` -8 → 8 with `scrub: true`). Factory images use two different speeds. Disable on phones.

### 4.5 Systems accordion
Open: height auto with Motion (400ms `ease-out-expo`); content fades up 12px (300ms, delay 100ms). Right image: new image crossfades (500ms) while scaling 1.04 → 1.0; label number counts to the new index. Icon "+" rotates 90° and morphs to "–" (250ms).

### 4.6 Numbers count-up
Stats count from 0 to the value in 1.6s (`ease-out-expo`), formatting with "+" suffix kept. Use `tabular-nums` so width does not jump.

### 4.7 Projects filtering (FLIP)
Wrap the grid in Motion `LayoutGroup`; tiles use `layout` + `AnimatePresence`. Leaving tiles fade+scale to 0.96 (200ms); remaining tiles move to their new position (450ms `ease-out-expo`); entering tiles fade in (300ms, stagger 30ms).

### 4.8 Lines & swoosh accents
- Section hairlines draw from left to right (`scaleX 0→1`, transform-origin left, 1100ms) when entering.
- CTA section: the giant swoosh outline (same path as logo) draws with `scrub` as the section scrolls through.
- Scroll progress: a 2px red bar at the very top of the viewport on long pages (projects detail, systems detail), `scaleX` bound to scroll progress.

### 4.9 Horizontal scroll (Factory process)
Pinned section; panels move horizontally with `scrub: 1` over `(panels-1) × 100vw` of scroll. Each panel's number counts and image scales slightly while centred. Phone: no pin, vertical list.

### 4.10 Marquee (optional, Factory or Home under stats)
A slow infinite marquee of system names in Mono ("DYER · DRITARE · SISTEME RRËSHQITËSE · …"), 40s per loop, pauses on hover. Off with reduced motion.

## 5. Hover & interaction
### 5.1 Buttons
- Primary: background colour transition 250ms; arrow translateX 0→4px; on press scale 0.98 (100ms).
- Secondary: a fill layer slides from left (`scaleX 0→1`, origin left, 400ms `ease-out-expo`), text colour inverts in sync.
### 5.2 Magnetic buttons (laptop, fine pointer only)
Large buttons and the WhatsApp FAB follow the cursor within a 80px radius: translate up to 30% of the distance (button) and 15% (label, for depth), using `gsap.quickTo` (duration 0.4, `power3.out`). Return to 0 on leave (0.6s, `elastic.out(1, 0.5)` is NOT allowed — use `power3.out`).
### 5.3 Links
Underline is a pseudo-element: on hover it shrinks to the right and regrows from the left (scaleX with origin swap, 400ms). Navbar active link keeps a static red underline.
### 5.4 Custom cursor (laptop, fine pointer only)
- Default: 8px white dot with `mix-blend-mode: difference`, follows the pointer with slight lag (`quickTo` 0.15s).
- Over links/buttons: grows to 40px ring (1px border), dot hidden.
- Over project tiles and gallery images: becomes a 88px solid circle (`ink-900` 85% + white Mono label "SHIKO" / "VIEW" localized).
- Over the 3D canvas: label "SCROLL" ; over draggable carousels: "TËRHIQ" (drag).
- Native cursor stays visible for text inputs. The custom cursor is hidden when the pointer leaves the window. Never on touch devices.
### 5.5 Cards & tiles
Image scale 1.0 → 1.04 (700ms `ease-out-expo`), overlay darkens (+15%), CTA label slides up 12px and fades in. Solution cards also lift 4px.
### 5.6 Mega-menu
Panel: clip-path `inset(0 0 100% 0)` → `inset(0)` 400ms `ease-out-expo`; items fade up with 40ms stagger. Closing: 250ms reverse, no stagger.
### 5.7 Mobile menu
Overlay reveals with `clip-path: circle(0 at top right → 150% at top right)` 600ms `ease-in-out-quart`; links rise from masks with 50ms stagger; hamburger lines morph into ×.

## 6. Loading states motion
- Skeleton shimmer: 1.4s linear infinite gradient sweep.
- Skeleton → content: crossfade 250ms.
- Image decoded: opacity 0→1 500ms (blur LQIP stays under until done).

## 7. Performance budget for motion
- Total JS for motion on first load ≤ 60KB gzip (GSAP core+ScrollTrigger+SplitText ~45KB, Lenis ~4KB). Motion (Framer) only in components that need it. three.js is **lazy-loaded** only when the 3D section approaches the viewport (IntersectionObserver, rootMargin 600px) and only on capable devices.
- No layout thrashing: read layout once per frame; use `will-change: transform` only during animation.
- `ScrollTrigger.refresh()` after fonts load (`document.fonts.ready`) and after images in pinned sections load.
- Kill all ScrollTriggers and Lenis listeners on route change (cleanup in `useEffect` / `gsap.context().revert()`).

## 8. Where NOT to animate
Forms inputs (except focus ring and validation messages fading in), legal text, tables with specs (only the section entrance), anything that blocks reading for more than 1s.

## 9. Reduced motion (`prefers-reduced-motion: reduce`)
- No intro, no Lenis, no parallax, no pinning, no cursor, no magnetic, no marquee, no 3D animation (show static render).
- Keep: opacity fades ≤ 150ms, accordion opening without height animation, page crossfade 150ms.
