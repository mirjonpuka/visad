# 05 — Scroll-driven 3D Aluminium Profile

## Goal
In the Home "Systems" section (UI spec §3.3A) a realistic aluminium window profile (thermally broken) is shown in 3D. While the user scrolls through the pinned section (~250vh), the profile rotates and **explodes** into its parts, each step explained by text on the left, then reassembles with the glass. It shows engineering quality without words.

**Is it too heavy?** No, if built like this:
- The geometry is **procedural** (2D outlines extruded with `THREE.ExtrudeGeometry`), so there is no 3D model file to download. Total extra download ≈ 160–200KB gzip (three + r3f + drei subset), loaded **only** when the section approaches the viewport and only on capable devices.
- No real-time shadows, no post-processing, `dpr` capped at 1.75, rendering paused when off-screen.
- Phones, low-power devices and reduced-motion users get a static image instead.

## Tech
- `three`, `@react-three/fiber`, `@react-three/drei` (`Environment`, `Lightformer`, `ContactShadows`, `PerformanceMonitor`).
- Component: `components/three/ProfileScene.tsx` (client only), loaded with `next/dynamic(() => import(...), { ssr: false })` inside `ProfileStory.tsx`.
- Scroll progress from GSAP ScrollTrigger (pinned section, `scrub: 1`) written to a shared ref/zustand store `progress ∈ [0,1]`; the scene reads it in `useFrame` and interpolates (no React re-renders per frame).

## Geometry (generic thermally-broken window profile, units = mm, scale 1 unit = 1mm, then scene scale 0.01)
Draw each part as a `THREE.Shape` (outer contour + holes for hollow chambers) and extrude along Z by **220mm** (a short piece of profile), `bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 2, curveSegments: 6`.
The coordinates below are a simplified, generic cross-section (not a copy of any ALUMIL drawing). Section width (X) 70mm, height (Y) 80mm.

| Part | Shape (X,Y in mm) | Material |
|---|---|---|
| **Outer aluminium shell** | Outer: rectangle x 0→26, y 0→80 with a 6×10 lip at top-right (x 26→32, y 70→80). Holes (chambers): rect x 2→24, y 2→36 and rect x 2→24, y 40→66 (wall thickness 2mm) | Aluminium |
| **Thermal break strip A** | Rect x 26→44, y 18→24, with dovetail ends: small triangles 2mm at x 26 and x 44 | Polyamide |
| **Thermal break strip B** | Rect x 26→44, y 56→62, same dovetails | Polyamide |
| **Inner aluminium shell** | Outer: rect x 44→70, y 0→80 with an L glazing bead seat (x 44→50, y 80→88). Holes: rect x 46→68, y 2→36 and x 46→68, y 40→66 | Aluminium |
| **Glazing bead** | Rect x 50→56, y 80→100 with a 1mm hollow | Aluminium |
| **EPDM gasket outer** | Rounded rect x 20→26, y 80→86, radius 2 | EPDM |
| **EPDM gasket inner** | Rounded rect x 44→50, y 88→94, radius 2 | EPDM |
| **Glass unit** | Two panes: x 26→32 (6mm) and x 38→44 (6mm), y 86→190 (height 104, cut at the top so it reads as "continuing"), spacer bar x 32→38, y 86→96 | Glass + spacer (aluminium dark) |

Centre the assembled group at the origin (`geometry.center()` on a merged bounding box, keep parts' relative offsets).

## Materials
| Name | Settings |
|---|---|
| Aluminium | `MeshPhysicalMaterial({ color: '#B9BDC2', metalness: 1, roughness: 0.32, clearcoat: 0.3, clearcoatRoughness: 0.4 })`. Optional anthracite variant `#3A3D42` (toggle in a small UI chip "Argjend / Antracit" on laptop) |
| Polyamide | `MeshStandardMaterial({ color: '#2A2C2F', roughness: 0.85, metalness: 0 })` |
| EPDM | `MeshStandardMaterial({ color: '#111214', roughness: 0.95 })` |
| Glass | `MeshPhysicalMaterial({ color: '#DDE8E6', transmission: 1, thickness: 6, roughness: 0.05, ior: 1.5, transparent: true, opacity: 1 })` (fallback when `PerformanceMonitor` reports low fps: plain `MeshStandardMaterial` opacity 0.25) |
| Accent | The section of the cut faces may show a **red 1px edge line** (`EdgesGeometry` on the outer shell, `LineBasicMaterial` `#F2000D`, opacity 0.6) during step 1 only, to tie in with the brand |

## Lighting & camera
- No HDR files: use drei `<Environment resolution={256}>` with 3–4 `<Lightformer>` rectangles (white, intensity 2–4) placed like studio softboxes; `background={false}`.
- One `directionalLight` (intensity 1.2) from top-left for the key highlight on the metal.
- `ContactShadows` (opacity 0.35, blur 2.5, far 4) rendered **once** (`frames={1}`) under the profile.
- Camera: `PerspectiveCamera` fov 30, position `[3.2, 1.6, 4.2]`, looking at the origin. Canvas background transparent (section background `ink-900` shows through).
- `dpr={[1, 1.75]}`, `gl={{ antialias: true, powerPreference: 'high-performance' }}`, `frameloop="demand"` and call `invalidate()` on progress change; set `frameloop="never"` when the canvas is off-screen.

## Scroll timeline (progress p from 0 to 1, pinned ~250vh)
Use smooth interpolation (`THREE.MathUtils.damp` towards target values each frame, lambda 6).

| Step (text on the left) | p range | Scene |
|---|---|---|
| 1. **Profili i aluminit** — "Profile ALUMIL me dhoma të shumëfishta për forcë dhe izolim." | 0.00–0.20 | Assembled profile without glass, slowly rotating Y from -25° to 15°. Red edge lines visible |
| 2. **Ura termike** — "Shiritat poliamidi ndajnë alumin e jashtëm nga i brendshmi dhe ndalojnë humbjen e nxehtësisë." | 0.20–0.40 | Outer shell moves -X by 40mm, inner shell +X by 40mm; thermal-break strips stay and get a soft highlight (emissive pulse 0→0.15) |
| 3. **Guarnicionet EPDM** — "Guarnicione EPDM për mbyllje hermetike ndaj ujit, ajrit dhe zhurmës." | 0.40–0.60 | Gaskets lift +Y by 30mm and rotate slightly; camera orbits to a 3/4 view (rotation Y 35°) |
| 4. **Xhami dyfish / trefish** — "Njësi xhami me hapësirë izoluese, e zgjedhur sipas projektit." | 0.60–0.80 | Glass unit slides down from +Y 200mm into place, panes separate to show the spacer then close |
| 5. **I montuar, i testuar** — "Çdo element montohet dhe kontrollohet në fabrikën tonë në Shkodër." | 0.80–1.00 | All parts move back to assembled positions; camera returns to front 3/4; a thin red line draws under the step title; a small Mono label appears in the canvas corner: "VISAD × ALUMIL" |

Left text column: the active step is white, the others 35% opacity; step change crossfades 300ms. A vertical 1px line next to the steps fills with red according to p.

## Fallbacks (decide once on mount)
Render the static image `brand/3d/profile-exploded.webp` (export it from the scene, see below) when **any** is true:
- `prefers-reduced-motion: reduce`
- viewport width < 768 **or** `pointer: coarse` only
- `navigator.hardwareConcurrency <= 4` or `navigator.deviceMemory <= 4` or `navigator.connection.saveData`
- WebGL2 not available
- `PerformanceMonitor` detects < 40fps for 2s → swap to the image smoothly (crossfade 400ms)

In fallback mode the section is not pinned; the 5 steps show as a normal list next to/below the image.

## Generating the static render
Add a dev-only route `/dev/profile-render` that renders the scene at p = 0.5 (exploded) at 2400×1600 with `preserveDrawingBuffer: true` and a "Download PNG" button (`gl.domElement.toDataURL`). Convert it to WebP (quality 82) and save to `public/brand/3d/profile-exploded.webp` (also a 1200px version). Remove the route from production builds.

## Acceptance criteria
- First load of Home does **not** include three.js (check the bundle analyzer).
- 60fps on a 2020 MacBook Air / mid Windows laptop with integrated graphics; no long tasks > 50ms while scrolling the section.
- Pinning works with Lenis; no jump when the pin starts/ends; resizing the window recalculates correctly.
- Fallback image shown on phones; layout identical in height to avoid CLS.
