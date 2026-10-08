# visad.al

New website for VISAD Construction. Specification: `_handoff/` (read-only).
Decisions: `DECISIONS.md` · Open client items: `TODO_CLIENT.md`.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000  (UI kit: /dev/kit)
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
node scripts/screenshot.mjs /dev/kit .screenshots --sections   # dev server running
```

## Sanity (CMS)

- Studio: http://localhost:3000/studio (Përmbajtja = content, Kërkesat = form submissions)
- Secrets in `.env.local` (not committed): project ID, dataset, read/write tokens, revalidate secret
- `npm run seed` creates the starting content (safe to re-run); `npm run seed -- --force` replaces it
- Dev check page: http://localhost:3000/dev/cms

## Assets

`npm run sync-assets` copies logos, favicons and WebP images from `_handoff/` into the project.
