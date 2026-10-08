# 01 — Project Brief

## Client
- **Company:** VISAD Construction (brand name: **VISAD**)
- **Location:** Rr. Shkodër–Koplik, km 10, Shkodër 4301, Albania
- **Phones:** +355 67 377 2989 · +355 67 255 9898
- **Email:** info@visad.al (do NOT publish the personal Gmail from the old site)
- **Domain:** visad.al (old site: WordPress + Elementor, 3 pages, Albanian only; it will be replaced completely)

## What Visad does
A mix of fabrication and contracting:
- Produces aluminium and PVC systems in its **own factory** in Shkodër and installs them with its own crews.
- **Certified ALUMIL partner** (Greek system supplier). All aluminium systems on the site are presented as ALUMIL-based.
- Product range: doors, windows, sliding systems, shutters (grila), balconies and railings (glass, stainless steel), stairs railings, façades.
- Claims from the old site, **to be confirmed by the client before launch**: 9,500+ projects, 16+ years of experience, clients in 5 countries.

## Positioning (3–5 years)
**Premium systems brand.** Same product scope, but seen as the highest-quality aluminium name in northern Albania and the region. It must look at least as serious as the big Tirana façade firms (benchmark competitor: ALCA, alca.al).

Positioning line: **"Precizion në çdo profil."** (Precision in every profile.)

## Target audiences (all four are important)
| Audience | What they need from the site |
|---|---|
| Private homeowners (houses, villas, renovations, diaspora building at home) | Trust, real photos, simple quote via WhatsApp, warranty |
| Developers & residential builders | Capacity, references of whole buildings, deadlines, B2B contact |
| Hotels & tourism (coast, lake, Theth) | Sliding systems, glass balconies, references, fast contact |
| Architects & public tenders | Technical datasheets, ALUMIL specs, certifications, tender form with documents |

## Proof points to use
1. **Own factory and machinery** (photos/video of production).
2. **Named flagship projects** (real Visad work only, never stock images labelled as projects).
3. ALUMIL certified partner status.

## Decisions already made
| Area | Decision |
|---|---|
| Languages | Albanian (default, `/`), English, Italian, German |
| Logo | Keep the existing logo (white letters, red S-swoosh). Redrawn as clean vector, see `brand/logo/` |
| Accent colour | Visad red from the logo |
| Visual direction | "Engineered minimalism": Swiss grotesk type, dark/light sections, aluminium greys, one red accent, big imagery |
| Inspiration | iqglassuk.com (structure, favourite), vitrocsa.com (cleanliness, systems accordion), sky-frame.com (smoothness), alumil.com (homeowner/professional split, NOT their navbar). alca.al = too long, avoid |
| Device priority | **Laptop first** (design at 1440px), then tablet, then phone. Phone must still be excellent |
| Motion | **Cinematic everywhere**: smooth scroll, reveals, page transitions, hover effects, magnetic buttons, custom cursor |
| Intro | Logo intro animation, first visit only |
| 3D | Scroll-driven 3D aluminium profile that explodes into its parts |
| Main contact channel | **WhatsApp first** (floating button everywhere), quote form second |
| Stack | Next.js (App Router) + TypeScript + Tailwind CSS + Sanity CMS, hosted on Vercel |
| CMS users | Client staff add projects (must be very simple); developer handles bigger changes |
| Images | All served as WebP/AVIF, skeleton loading states everywhere |
| Budget / timeline | €10k+, no fixed date: quality over speed |

## Phase 2 (not in launch, but architecture must allow it)
- Window configurator (type, colour, size → estimate)
- Before/after sliders on project pages
- Client portal for developers (later)

## Open items for the client
- Confirm stats (projects, years, countries) and founding year.
- Which ALUMIL series they fabricate (e.g. window, sliding, façade lines) + ALUMIL datasheets/PDFs + official partner logo kit.
- Project list: name, city, year, systems used, client type, for every project photo.
- Original photos from the phone (not WhatsApp copies); professional shoot later.
- Job openings (for Careers).
