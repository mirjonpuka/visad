# 09 — Assets & Image Slots

## What is in `images/`
| Folder | Content |
|---|---|
| `images/originals/` | The 11 photos as received (renamed, untouched) |
| `images/edited/` | Edited masters: AI-upscaled ×4, white balance, contrast, colour, sharpening, **perspective-straightened (vertical lines truly vertical, horizontals level on frontal shots) and re-cropped so the subject is centred/symmetrical**. JPG q92, 1150–2560px. Upload these to Sanity |
| `images/web/` | Ready WebP versions in 640 / 960 / 1600 / 2560 px widths (q80) |
| `images/crops/` | Pre-cut WebP crops for specific slots (hero 16:9, mobile 4:5, tiles 16:10) |
| `images/manifest.json` | Machine-readable list: id, alt texts (sq/en), slots, sizes, blurDataURL. Used by the seed script |
| `images/before-after.jpg` | Contact sheet: original vs edited + straightened + centred |

**Honest quality note:** the source photos are only 400–640px (WhatsApp/website copies). The AI upscale makes them usable for launch, but fine detail (small text, far details) is reconstructed and is not perfect at 100% zoom. Replace them with originals from the phone or the professional shoot as soon as possible: in Sanity, upload the new image on the same field and everything updates.

## The 11 real photos and where they go
All are real Visad work, so all may be used on project pages.

| File id | What it shows | Slots (see UI spec) |
|---|---|---|
| `project-terrace-glass-railing-vineyard` | Terrace with glass railing, vineyards and mountains | **Home hero** (`crops/…-hero-16x9.webp`, mobile `…-mobile-4x5.webp`), project page, homeowners alt |
| `project-fishta-hotel-glass-balconies` | Fishta Hotel, glass balconies, glass entrance | Home project tile 1 (large), system Façades, solution Hotels |
| `project-house-glass-railings` | House with glass porch and balcony railings | Home project tile 2, solution Homeowners |
| `railing-glass-staircase` | Glass staircase railing | Home project tile 3, system Balconies (alt) |
| `project-villa-glass-balconies-shutters` | 3-storey villa, glass balconies, white shutters, doors | Home project tile 4 (tall), system Shutters, system Doors (door crop) |
| `project-residential-blocks-balconies` | Residential blocks with balconies | Home project tile 5, solution Developers |
| `railing-stainless-steel-balcony` | Stainless balcony railing + window | system Balconies & railings |
| `window-pvc-historic-facade` | New PVC window in a historic stone façade | system Windows |
| `installation-folding-doors` | Installer fitting aluminium folding doors | Home factory image 3, system Sliding, Careers hero |
| `visad-headquarters-factory` | Visad HQ/factory building with trucks | Home factory image 1 (wide), Factory hero, Contact |
| `visad-truck-aluminium-frames` | Visad truck with aluminium frames | Home factory image 2 |

Project documents to create from these (names `[TO CONFIRM]` except Fishta Hotel): Fishta Hotel · Vila me tarracë (terrace) · Shtëpi me parmakë xhami · Vilë trekatëshe · Kompleks banimi · Shkallë me parmakë xhami · Rinovim dritareje në fasadë historike.

## Slots still needing a photo (render `PlaceholderImage` with this note)
| Slot | Note shown at the bottom centre |
|---|---|
| `systems-hero` | PHOTO: close-up of a modern aluminium window corner, anthracite, daylight |
| `system-doors` (hero, 4:5) | PHOTO: Visad aluminium entrance door, full height, with handle detail (until then the villa door crop is used) |
| `system-sliding` (hero) | PHOTO: large finished sliding glass doors opening to a terrace |
| `factory-machines-1..4` | PHOTO: CNC cutting saw / crimping machine / assembly bench / stacked ALUMIL profiles |
| `process-1..5` | PHOTO: measuring on site / technical drawing / CNC cut / assembly / installation |
| `solution-architects` | PHOTO: technical drawings next to aluminium profile samples |
| `alumil-partner-logo` | ALUMIL certified partner logo (official partner kit) |
| `team-*` | PHOTO: portrait of team member, neutral background |
| `home-hero-video` (optional) | VIDEO: 10–15s slow loop, factory → installation → finished façade, no text |
| Project galleries | REAL VISAD PHOTO ONLY: 6–12 photos per project (wide exterior, details, interior) |

## Brand assets
- `brand/logo/` — SVG logo variants, PNG exports (600/2000px), favicon set (see Brand guide §1).
- `brand/intro/logo-intro-demo.html` — working intro animation (open in a browser; "Replay" button top-right).
- `brand/3d/profile-exploded.webp` — generated in Phase 6 from the 3D scene.

## Shot list for the professional shoot (send to the photographer)
1. 5–6 finished flagship projects: wide exterior at golden hour/dusk, 3 details each (corners, handles, thresholds), 2 interiors with views through the glass.
2. Factory: wide hall, each machine in action, hands assembling, stacked profiles, quality check.
3. Installation: crew fitting a large sliding door, a façade panel.
4. Team: group photo + 3–4 portraits.
5. Drone: HQ and 2 large projects.
6. Video: 30–40 short clips (5–10s, 4K, stable) for the hero loop and social media.
Format: RAW + JPG, horizontal and vertical versions of the key shots, verticals straight.
