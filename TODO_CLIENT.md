# Still needed from the client ([TO CONFIRM])

Everything on the site marked `[TO CONFIRM]` or shown as a placeholder photo is listed here.

## Facts & numbers
- [ ] Stats: **9500+** projects, **16+** years, **5** countries (from the old site) — confirm or correct
- [ ] Founding year
- [ ] Reply time: "same day" (CTA) or "within 24 hours" (contact page + form success) — pick one
- [ ] 4th factory stat (e.g. factory m² or team size) — only a real value
- [ ] Opening hours
- [ ] Social media links (Facebook, Instagram)
- [ ] Lead notification email (default info@visad.al)

## ALUMIL
- [ ] Which ALUMIL series are fabricated (window, sliding, façade lines)
- [ ] ALUMIL datasheets / catalogues (PDF)
- [x] ALUMIL logo (received: `public/brand/partners/alumil-logo.svg`)
- [ ] ALUMIL partner certificate (PDF) for "Certifikatat"
- [ ] CE / ISO certificates, if any

## Projects (for each photo) — seeded in Sanity, edit them in /studio → Projektet
- [ ] For the 7 seeded projects: confirm project type, systems used and "Për kë" (inferred from the photos)
- [ ] Name, city, year, systems used, client type
  - Fishta Hotel (name known) · Vila me tarracë · Shtëpi me parmakë xhami · Vilë trekatëshe · Kompleks banimi · Shkallë me parmakë xhami · Rinovim dritareje në fasadë historike
- [ ] Original photos from the phone (not WhatsApp copies)
- [ ] 6–12 real photos per project for the galleries

## Photos still missing (temporary stock photos on the site, each labelled "will be replaced with …")
- [ ] Systems hero: close-up of a modern aluminium window corner, anthracite
- [ ] Doors hero: Visad aluminium entrance door with handle detail
- [ ] Sliding hero: large finished sliding glass doors opening to a terrace
- [ ] Façades: a Visad glass + aluminium façade project (stock photo used so Fishta Hotel is not shown twice)
- [ ] Factory machines ×4, process steps ×5
- [ ] Architects solution: technical drawings + profile samples
- [ ] Team portraits
- [ ] Optional hero video (10–15s loop)
- [ ] A stronger Home hero photo (current terrace crop is mostly floor tiles)
- [ ] Higher-resolution HQ photo (current is 1152px, soft as a full-width Factory hero)

## Contact & WhatsApp
- [ ] WhatsApp prefilled message wording (current: "Përshëndetje VISAD! Ju shkruaj nga faqja: …")
- [ ] Exact Google Maps location / pin for the address link (currently a search link)

## Setup (owner)
- [ ] Sanity → API → CORS origins: add `http://localhost:3000` with **Allow credentials** (Studio login)
- [ ] Before launch (Phase 10): create new read/write tokens (the current ones were shared in chat) and a webhook to `https://visad.al/api/revalidate`
- [ ] Map pin (Sanity → Cilësimet e faqes → Vendndodhja në hartë)
- [ ] Privacy policy text (seeded as [TO CONFIRM])

## Inner pages (Phase 7) — sections stay hidden until this content exists
- [ ] Per system: overview text, 4 benefits, ALUMIL series with 3 specs each, spec table, cross-section drawing, colours/finishes (all from the ALUMIL datasheets — no invented numbers)
- [ ] Systems page: 3 key values for the intro row (e.g. Uf), only from datasheets
- [ ] Solutions: 3–4 "Çfarë ju ofrojmë" blocks per audience; hero titles for homeowners, developers, architects (only hotels has one, from the UI spec)
- [ ] Careers: intro text and 4 benefits (hidden until provided)
- [ ] Factory: intro text (now the Home factory text), process step descriptions
- [ ] Project stories ("Sfida & zgjidhja"), client names (only if they agree to be named), area m²

## Other
- [ ] Job openings (Careers)
- [ ] FAQ questions/answers per system
- [ ] Italian and German texts: review by a native speaker (Phase 9)
