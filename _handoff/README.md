# VISAD — Website Handoff Package

Everything needed to build the new visad.al with Claude Code.

## Start here
1. Open `00_CLAUDE_CODE_PROMPT.md`. It explains how to use this package and contains the prompts to paste into Claude Code, phase by phase.
2. Open `brand/intro/logo-intro-demo.html` in your browser to see the logo intro animation (it works offline).
3. Look at `images/before-after.jpg` to see the photo edits.

## Contents
```
00_CLAUDE_CODE_PROMPT.md     Master prompt + 10 phase prompts (paste one at a time)
docs/
  01_PROJECT_BRIEF.md        Client, positioning, audiences, every decision taken
  02_BRAND_GUIDE.md          Logo rules, colour tokens, typography, grid, imagery rules, tone
  03_UI_UX_SPEC.md           Detailed UI/UX: every page, section, component, state, breakpoint, skeletons
  04_MOTION_SPEC.md          Intro, page transitions, scroll + hover animations with exact timings
  05_3D_PROFILE_SPEC.md      Scroll-driven 3D aluminium profile (procedural, lightweight, with fallbacks)
  06_ARCHITECTURE.md         Stack, folders, i18n, caching, WebP images, forms, SEO, performance budgets
  07_CMS_SCHEMA.md           Sanity schemas (the database), lead storage, GROQ queries, seed data
  08_CONTENT.md              All copy in Albanian + English
  09_ASSETS.md               Which photo goes where, missing photos, shot list for the photographer
brand/
  logo/                      Vector logo (SVG) variants, PNG exports, favicons
  intro/logo-intro-demo.html Working intro animation (reference implementation)
images/
  originals/                 The 11 photos as received
  edited/                    Edited, straightened, centred high-res masters (JPG) → upload to Sanity
  web/                       WebP in 640/960/1600/2560 widths
  crops/                     WebP crops for hero / mobile / tiles
  manifest.json              Alt texts (sq/en), slots, sizes, blur placeholders
  before-after.jpg           Original vs edited contact sheet
```

## Still needed from the client
- Confirm: number of projects, years, countries, founding year, reply time ("same day"/"24 hours").
- ALUMIL: which series they use, datasheets (PDF), official partner logo + certificate.
- For each project photo: project name, city, year, systems used.
- Original photos from the phone (not WhatsApp copies), then a professional shoot (shot list in `docs/09_ASSETS.md`).
- Job openings, opening hours, social media links.
