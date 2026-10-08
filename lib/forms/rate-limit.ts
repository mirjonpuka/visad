import "server-only";

/**
 * 5 submissions / 10 min / IP (Architecture §7, "optional"). In-memory per
 * server instance: enough against a single bot hammering the form. Swap for
 * Upstash/Vercel KV if abuse ever spans instances.
 */
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

export function rateLimited(key: string) {
  // Local development (and the e2e suite) submit far more often than a visitor
  if (process.env.NODE_ENV !== "production") return false;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep the map small
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return false;
}
