# visad.al

Website of VISAD Construction (ALUMIL partner, Shkodër). Next.js 16 · Sanity · Vercel.

- Specification: `_handoff/` (read-only)
- Decisions and conflicts: `DECISIONS.md`
- What the client still has to provide: `TODO_CLIENT.md`
- QA results: `QA_REPORT.md`
- Going live: `LAUNCH.md`

---

## 1. Run locally (developer)

Requirements: Node.js 20+, npm.

```bash
npm install
cp .env.example .env.local   # fill in the values (ask the owner; never commit this file)
npm run dev                  # http://localhost:3000
```

| URL | What |
|---|---|
| http://localhost:3000 | Site in Albanian (`/en`, `/it`, `/de` for the other languages) |
| http://localhost:3000/studio | Sanity Studio: **Përmbajtja** (content) and **Kërkesat** (form submissions) |
| http://localhost:3000/dev/kit | UI kit (dev only) |
| http://localhost:3000/dev/profile-render | 3D render export (dev only) |

### Scripts

| Command | What it does |
|---|---|
| `npm run lint` · `npm run typecheck` · `npm run build` | Quality gates (run before every commit) |
| `npx playwright test` | End-to-end + accessibility tests (starts/reuses the dev server). `BASE_URL=http://localhost:3001` tests a production build |
| `npm run test:cleanup-leads` | Deletes the test requests ("E2E Test") the form tests create |
| `npm run seed` | Creates the starting CMS content if missing (`-- --force` replaces it) |
| `npm run profile:render` | Re-exports the static 3D render (dev server running) |
| `npm run sync-assets` | Copies logos, favicons and WebP images from `_handoff/` |
| `node scripts/screenshot.mjs /path out --widths=1440,390` | Screenshots of a page |

### Where things are

```
app/[locale]/…        pages (folder names = Albanian URLs; other languages in i18n/routing.ts)
app/actions/leads.ts  form submissions (Server Actions)
app/api/…             revalidate webhook, uploads, OG images, draft mode
components/           ui · layout · sections · motion · forms · three · media · seo
sanity/               schema, Studio structure, queries, types
messages/*.json       UI texts per language (same keys in all four files)
lib/                  site data, SEO, forms (schemas, limits, Turnstile), helpers
```

---

## 2. Udhëzues për redaktorët (në shqip)

Hyrja në Studio: **https://visad.al/studio** → identifikohuni me llogarinë tuaj Sanity.
Ndryshimet shfaqen në faqe pak sekonda pasi shtypni **Publish**.

### 2.1 Si të shtoni një projekt të ri

1. Hapni **Përmbajtja → Projektet** dhe klikoni **+** (lart djathtas) → **Projekt i ri**.
   `[FOTO: lista e projekteve me butonin +]`
2. **Emri i projektit**: shkruani emrin në shqip (fusha "SQ"). Për anglisht, italisht dhe gjermanisht klikoni **+ EN / + IT / + DE**. Nëse nuk i plotësoni, faqja shfaq anglisht ose shqip.
   `[FOTO: fusha e titullit me gjuhët]`
3. **Adresa (slug)**: klikoni **Generate** te çdo gjuhë. Kjo krijon adresën e faqes, p.sh. `visad.al/projektet/vila-ne-shkoder`.
4. **Foto kryesore**: tërhiqni foton (vetëm foto reale të Visad, jo foto nga interneti). Pastaj:
   - shkruani **Përshkrim (alt)**: çfarë tregon fotoja (p.sh. "Vilë me dritare alumini antracit");
   - klikoni mbi foto → **Edit** dhe vendosni rrethin (hotspot) mbi pjesën më të rëndësishme, që të mos pritet keq në telefon.
   `[FOTO: zgjedhja e hotspot-it]`
5. Plotësoni **Qyteti**, **Viti**, **Lloji** (Banim / Vila / Hotel / Komercial / Publik) dhe **Sistemet e përdorura** (zgjidhni nga lista).
6. **Galeria**: tërhiqni disa foto njëherësh (6–12 foto). Për secilën shkruani përshkrimin (alt).
   `[FOTO: galeria me disa foto]`
7. Te grupi **Më shumë** (opsionale): Klienti (vetëm nëse ka dhënë leje), Sipërfaqja (m²), Përmbledhje (1–2 fjali, shfaqet në Google), **Sfida & zgjidhja** (teksti i historisë), **Për kë** (në cilat faqe zgjidhjesh të shfaqet).
8. Për ta shfaqur në kryefaqe: aktivizoni **Shfaqe në kryefaqe** dhe jepni **Renditjen (1–5)**.
9. Klikoni **Publish** (poshtë djathtas). Projekti del menjëherë te `/projektet` dhe në filtra.
   `[FOTO: butoni Publish]`

> Parapamje para publikimit: skeda **Parapamje** (Presentation) tregon faqen reale me ndryshimet e paruajtura.

### 2.2 Si të zëvendësoni një foto të përkohshme

Fotot e përkohshme kanë një shënim të vogël poshtë: *"Temporary photo — will be replaced with …"*.

1. Gjeni dokumentin ku ndodhet fotoja (p.sh. **Sistemet → Dyer → Foto kryesore**, ose **Faqja e fabrikës → Makineritë**).
2. Klikoni mbi foto → **Replace** dhe ngarkoni foton e re reale.
3. Hiqni shenjën **Foto e përkohshme?** (bëjeni jo aktive). Shënimi zhduket nga faqja.
4. Përditësoni **Përshkrim (alt)** dhe, nëse duhet, hotspot-in.
5. **Publish**.
   `[FOTO: fusha "Foto e përkohshme?"]`

Lista e plotë e fotove që mungojnë: `TODO_CLIENT.md` → "Photos still missing".

### 2.3 Përkthimet ("Rishiko")

Tekstet në italisht dhe gjermanisht janë përkthyer automatikisht. Dokumentet e tilla kanë etiketën **Rishiko IT/DE**.
Pasi një folës amtare t'i ketë kontrolluar, hapni dokumentin → fusha **Rishiko përkthimin** → hiqni gjuhën → **Publish**.
Etiketa **Mungon EN/IT/DE** do të thotë që mungon një përkthim (faqja shfaq anglisht ose shqip në vend të tij).

### 2.4 Kërkesat nga formularët

Çdo kërkesë për ofertë, tender ose aplikim pune ruhet te **Studio → Kërkesat** dhe vjen me email (nëse është konfiguruar Resend).
Ndryshoni **Statusin** (E re → U kontaktua → Oferta u dërgua → Fituar / Humbur) dhe shkruani **Shënime të brendshme**. Fotot dhe dokumentet hapen nga lidhjet te kërkesa.

### 2.5 Të tjera

- **Cilësimet e faqes**: telefonat, email-i, WhatsApp, orari, rrjetet sociale, numrat (9500+ …), logoja dhe certifikata e ALUMIL.
- **Faqet e tjera**: foto dhe tekste hyrëse për Sistemet, Projektet, Karrierën, Kontaktin.
- **Pozicionet e punës**: shtoni një pozicion dhe aktivizoni **Aktiv**; kur mbyllet, çaktivizojeni.
- Fushat e specifikave teknike (Uw, Uf, …): **vetëm vlera nga fletët teknike ALUMIL**.
