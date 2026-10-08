import "server-only";
import { TURNSTILE_TEST_SITE_KEY } from "./turnstile";

export type FormConfig = { siteKey: string; uploadMode: "blob" | "local" };

/** Public form settings for the client (no secrets). */
export function getFormConfig(): FormConfig {
  return {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY,
    uploadMode: process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local",
  };
}
