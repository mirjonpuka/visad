# Launch checklist — visad.al on Vercel

Steps marked **(owner)** need your accounts/access. Everything else is ready in the code.

## 0. Review link for the client (before the real launch)

A free Vercel project gives a link like `visad-review.vercel.app` you can send to the client.

1. Push the code to GitHub (private repository).
2. vercel.com → **Add New → Project** → import the GitHub repository → Framework: Next.js (auto).
3. **Environment Variables** (copy from your `.env.local`):
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_LEADS_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET`, plus
   - `PREVIEW_SITE` = `true` (hidden from Google; forms work without Turnstile/Blob/Resend)
   - `NEXT_PUBLIC_SITE_URL` = the Vercel URL (e.g. `https://visad-review.vercel.app`) — set it after the first deploy, then redeploy
4. **Deploy**. Then in sanity.io/manage → API → CORS origins add the Vercel URL with **Allow credentials** (so `/studio` works there too).
5. Send the link. Form requests the client tests appear in Studio → Kërkesat (no emails until Resend is set up).

## 1. Accounts & keys (owner)
- [ ] **Vercel** project from this Git repository (framework: Next.js, root `/`, build `npm run build`)
- [ ] **Sanity**: create **new** tokens (the current ones were shared in chat): sanity.io/manage → project `c5x17bia` → API → Tokens
  - Viewer → `SANITY_API_READ_TOKEN`
  - Editor → `SANITY_API_WRITE_TOKEN`
  - then **delete the old tokens**
- [ ] **Cloudflare Turnstile**: add site `visad.al` (widget mode *Managed*) → site key + secret
- [ ] **Vercel Blob**: Vercel → Storage → Create Blob store → connect to the project (adds `BLOB_READ_WRITE_TOKEN`)
- [ ] **Resend**: add domain `visad.al`, add the DNS records it shows, wait for "Verified" → API key

## 2. Environment variables (Vercel → Settings → Environment Variables, Production + Preview)
See `.env.example` for the full list and comments.

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `c5x17bia` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_LEADS_DATASET` | `leads` |
| `SANITY_API_READ_TOKEN` / `SANITY_API_WRITE_TOKEN` | new tokens (step 1) |
| `SANITY_REVALIDATE_SECRET` | a long random string (also used in the webhook) |
| `NEXT_PUBLIC_SITE_URL` | `https://visad.al` (Preview: leave as is, robots.txt blocks previews) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | from Turnstile |
| `BLOB_READ_WRITE_TOKEN` | set automatically by the Blob store |
| `RESEND_API_KEY` | from Resend |
| `LEADS_FROM_EMAIL` | `VISAD Construction <noreply@visad.al>` |

Without Turnstile secret / Blob token the **production** deployment refuses submissions/uploads on purpose.

## 3. Sanity (owner)
- [ ] **CORS origins** (API → CORS): add `https://visad.al` and `https://www.visad.al` with **Allow credentials** (Studio login), plus the Vercel preview domain if you edit there
- [ ] **Webhook** (API → Webhooks → Create):
  - URL `https://visad.al/api/revalidate` · Dataset `production` · Trigger on create, update, delete
  - Filter: leave empty · Projection: `{_type, "slugs": slug[].value.current}`
  - HTTP method POST · Secret = `SANITY_REVALIDATE_SECRET`
- [ ] Members: client = **Editor**, developer = **Administrator**
- [ ] `leads` dataset stays **private**

## 4. Domain (owner)
- [ ] Vercel → Domains: add `visad.al` and `www.visad.al`; set `www.visad.al` → **Redirect to visad.al** (the code also redirects www → apex)
- [ ] At the DNS provider: the A / CNAME records Vercel shows. **Do not touch the MX records** (email stays where it is)
- [ ] Wait for the SSL certificate (automatic)

## 5. After the first deploy
- [ ] Open https://visad.al, /en, /it, /de, a project, the contact page; send one test request per form (then set it to "Humbur" or delete it in Studio → Kërkesat)
- [ ] Publish a small change in Studio → visible after a reload (webhook works)
- [ ] https://visad.al/sitemap.xml and /robots.txt use `https://visad.al`
- [ ] Vercel → Analytics and Speed Insights: enable both (cookieless)

## 6. Google (owner)
- [ ] **Search Console**: add property `visad.al` (DNS verification) → Sitemaps → submit `https://visad.al/sitemap.xml`
- [ ] **Google Business Profile**: website = `https://visad.al`; same name, address and phone as on the site (JSON-LD uses Sanity "Cilësimet e faqes")
- [ ] After a week: Search Console → Pages / Core Web Vitals; Vercel Speed Insights for real mobile numbers (QA_REPORT.md §2)

## 7. Before announcing
- [ ] All `[TO CONFIRM]` items in `TODO_CLIENT.md` answered (search the site for "TO CONFIRM")
- [ ] Privacy policy text in Studio → Faqe ligjore → Privatësia
- [ ] Italian/German reviewed ("Rishiko" badges gone)
