/**
 * Feature flags. Kept in their own module so client components can import
 * them without pulling in lib/site.ts (and the image manifests) — DECISIONS D5.x.
 */

/** Cookie banner is built but off at launch (DECISIONS D1.37). */
export const COOKIE_BANNER_ENABLED = false;
