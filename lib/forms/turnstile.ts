import "server-only";

/**
 * Cloudflare Turnstile verification (Architecture §7.3). Without keys
 * (local development) Cloudflare's documented test secret is used, which
 * accepts the test site key's tokens. On the production deployment missing
 * keys fail closed.
 */
const TEST_SECRET = "1x0000000000000000000000000000000AA";

export async function verifyTurnstile(token: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret && process.env.VERCEL_ENV === "production") {
    console.error("[turnstile] TURNSTILE_SECRET_KEY missing in production");
    return false;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret: secret ?? TEST_SECRET, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("[turnstile] rejected", data["error-codes"]);
    return Boolean(data.success);
  } catch (error) {
    console.error("[turnstile] verify failed", error);
    return false;
  }
}

/** Public site key; Cloudflare's always-pass test key when not configured. */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
