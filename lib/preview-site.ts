/**
 * Review deployment for the client (PREVIEW_SITE=true on Vercel): hidden from
 * search engines, forms work with Cloudflare's Turnstile test keys and
 * uploads use the Sanity fallback — no Resend/Turnstile/Blob accounts needed
 * yet. Remove the variable for the real launch (LAUNCH.md).
 */
export const PREVIEW_SITE = process.env.PREVIEW_SITE === "true";

/** True on the real, public production site (strict: keys required). */
export const STRICT_PRODUCTION = process.env.VERCEL_ENV === "production" && !PREVIEW_SITE;
