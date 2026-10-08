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

## Assets

`npm run sync-assets` copies logos, favicons and WebP images from `_handoff/` into the project.
