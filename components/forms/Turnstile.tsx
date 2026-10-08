"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;

function loadScript() {
  loading ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      loading = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(el);
  });
  return loading;
}

export type TurnstileHandle = { reset: () => void };

/**
 * Cloudflare Turnstile, "interaction-only": invisible unless Cloudflare needs
 * the visitor to click (UI §11.2). Tokens are single-use, so the form resets
 * the widget after each submission attempt.
 */
export const Turnstile = forwardRef<
  TurnstileHandle,
  { siteKey: string; locale: string; onToken: (token: string) => void }
>(function Turnstile({ siteKey, locale, onToken }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const tokenRef = useRef(onToken);
  useEffect(() => {
    tokenRef.current = onToken;
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      tokenRef.current("");
      if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          language: locale === "sq" ? "auto" : locale,
          callback: (token: string) => tokenRef.current(token),
          "expired-callback": () => tokenRef.current(""),
          "error-callback": () => tokenRef.current(""),
        });
      })
      .catch(() => tokenRef.current(""));
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, locale]);

  return <div ref={box} className="empty:hidden" />;
});
