"use client";

import { useEffect, useState } from "react";

/** Hidden inside the Presentation iframe (the Studio shows its own status). */
export function DraftModeBanner() {
  const [inIframe, setInIframe] = useState(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInIframe(window.self !== window.top));
    return () => cancelAnimationFrame(id);
  }, []);
  if (inIframe) return null;

  return (
    <form
      method="POST"
      action={`/api/draft-mode/disable?redirect=${encodeURIComponent(
        typeof window === "undefined" ? "/" : window.location.pathname,
      )}`}
      className="fixed bottom-4 left-4 z-[70] flex items-center gap-3 rounded-base bg-ink-800 py-2 pr-2 pl-4 font-mono text-label text-text-on-dark uppercase shadow-mega"
    >
      <span>Parapamje (drafte)</span>
      <button type="submit" className="rounded-base bg-red-600 px-3 py-2 text-white hover:bg-red-700">
        Dil
      </button>
    </form>
  );
}
