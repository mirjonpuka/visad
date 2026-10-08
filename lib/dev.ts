/**
 * Dev-only routes (/dev/kit, later /dev/profile-render) are available in
 * development and on preview deployments, never in production.
 * Set ENABLE_DEV_ROUTES=true to see them in a local production build.
 */
export const devRoutesEnabled =
  process.env.NODE_ENV !== "production" ||
  process.env.VERCEL_ENV === "preview" ||
  process.env.ENABLE_DEV_ROUTES === "true";
