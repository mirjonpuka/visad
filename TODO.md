# VISAD website: to do

What is left before visad.al goes live, in order. Step-by-step instructions are in `LAUNCH.md`; the full list of content the client still owes is in `TODO_CLIENT.md`.

Review link (live now): https://visadconstruction.vercel.app (hidden from Google, forms save to Studio but send no emails).

## 1. Check now
- [ ] On a real iPhone, scroll the Home "Sistemet" section: the window should open behind the text (refresh twice to get the latest version)
- [ ] Hover the "Powered by Ridge" badge on a laptop: brighter, no movement
- [ ] Refresh Home: the logo intro plays; open another page and come back: it does not

## 2. Price and agreement
- [ ] Send the quote: Custom / Advanced, about **ALL 150,000** one-time (about ALL 160,000 if each extra language is charged)
- [ ] 50% deposit (ALL 75,000) before launch work, 50% at launch
- [ ] Offer monthly maintenance (ALL 5,000 / month)
- [ ] Fix the Ridge Stack price sheet: "Social media setup ALL ,000" is missing the number
- [ ] Tell the client about yearly costs: domain, Vercel Pro hosting (about $20 / month; the free plan is not for business use), business email if needed

## 3. Accounts and keys (owner) — `LAUNCH.md` §1–3
- [ ] Vercel: move the project to the Pro plan (commercial site)
- [ ] Resend: add the domain visad.al, add its DNS records, then `RESEND_API_KEY` (without it no form emails are sent)
- [ ] Cloudflare Turnstile: site for visad.al, then the site key and secret (replace the test keys)
- [ ] Vercel Blob store connected to the project (photo, document and CV uploads)
- [ ] Sanity webhook to `https://visad.al/api/revalidate` (edits show up at once instead of after up to an hour)
- [ ] Sanity CORS origins: `https://visad.al` and `https://www.visad.al`
- [ ] Sanity members: client as Editor
- [ ] Recommended: new Sanity tokens (the current ones were shared in chat; you chose to keep them for now)

## 4. Go live (owner) — `LAUNCH.md` §4–6
- [ ] Vercel → Domains: add visad.al and www.visad.al (www redirects to visad.al); add the DNS records; do not touch the MX (email) records
- [ ] Environment variables: `PREVIEW_SITE` removed or `false`, `NEXT_PUBLIC_SITE_URL` = `https://visad.al`, then redeploy
- [ ] Test every form once on visad.al, then delete the test requests in Studio → Kërkesat
- [ ] Vercel Analytics and Speed Insights on
- [ ] Google Search Console: add visad.al, submit `https://visad.al/sitemap.xml`
- [ ] Google Business Profile: website = https://visad.al, same name, address and phones as the site
- [ ] Delete the Vercel token used during setup

## 5. Content from the client — details in `TODO_CLIENT.md`
- [ ] Confirm the stats: 9500+ projects, 16+ years, 5 countries
- [ ] Opening hours (the footer shows [TO CONFIRM])
- [ ] Reply time: "same day" or "within 24 hours"
- [ ] Social media links
- [ ] Privacy policy text (Studio → Faqe ligjore → Privatësia)
- [ ] Project names, cities, years and systems for the 7 projects (6 are marked [TO CONFIRM]), plus original photos
- [ ] Real photos to replace the temporary stock ones (each is labelled on the site)
- [ ] ALUMIL series, datasheets and partner certificate (system pages keep those sections hidden until then)
- [ ] Exact map pin for the address
- [ ] Italian and German texts checked by a native speaker
- [ ] Job openings, if any (Careers shows the general application until then)

## 6. Before announcing
- [ ] Search the site for "TO CONFIRM": nothing left
- [ ] One last pass on phone and laptop
