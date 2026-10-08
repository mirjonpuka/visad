"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { LeadResult } from "@/app/actions/leads";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/Button";
import type { SubmissionMeta } from "@/lib/forms/schemas";
import { Turnstile, type TurnstileHandle } from "./Turnstile";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Submission plumbing shared by the quote, tender and job forms: Turnstile
 * token, honeypot, the server action call, retry banner (data kept) and the
 * success panel (UI §11.2).
 */
export function useLeadSubmit<V>(
  action: (values: V, meta: SubmissionMeta) => Promise<LeadResult>,
  onFieldErrors: (fields: Record<string, string>) => void,
) {
  const locale = useLocale() as SubmissionMeta["locale"];
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState<"rate" | "other">("other");
  const token = useRef("");
  const honeypot = useRef<HTMLInputElement>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const [verifying, setVerifying] = useState(false);

  const waitForToken = async () => {
    for (let i = 0; i < 50 && !token.current; i++) {
      setVerifying(true);
      await new Promise((r) => setTimeout(r, 200));
    }
    setVerifying(false);
    return token.current;
  };

  const submit = useCallback(
    async (values: V, job?: SubmissionMeta["job"]) => {
      setStatus("submitting");
      try {
        const turnstileToken = await waitForToken();
        const result = await action(values, {
          locale,
          sourcePage: window.location.pathname,
          turnstileToken,
          website: honeypot.current?.value ?? "",
          ...(job ? { job } : {}),
        });
        if (result.ok) {
          setStatus("success");
          return;
        }
        if (result.reason === "invalid" && result.fields) onFieldErrors(result.fields);
        setReason(result.reason === "rate" ? "rate" : "other");
        setStatus(result.reason === "invalid" && result.fields ? "idle" : "error");
      } catch {
        setReason("other");
        setStatus("error");
      } finally {
        // Turnstile tokens are single-use
        turnstile.current?.reset();
      }
    },
    [action, locale, onFieldErrors],
  );

  const setToken = useCallback((value: string) => {
    token.current = value;
  }, []);

  return { status, reason, verifying, submit, honeypot, turnstile, setToken };
}

/** Turnstile + an off-screen honeypot field humans never see. */
export function SecurityFields({
  siteKey,
  honeypotRef,
  turnstileRef,
  onToken,
}: {
  siteKey: string;
  honeypotRef: React.RefObject<HTMLInputElement | null>;
  turnstileRef: React.RefObject<TurnstileHandle | null>;
  onToken: (token: string) => void;
}) {
  const locale = useLocale();
  return (
    <>
      <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Website
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <Turnstile ref={turnstileRef} siteKey={siteKey} locale={locale} onToken={onToken} />
    </>
  );
}
export function SubmitError({ reason, onRetry }: { reason: "rate" | "other"; onRetry: () => void }) {
  const t = useTranslations("form");
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-base border border-red-500 bg-red-500/5 p-5 sm:flex-row sm:items-center">
      <AlertTriangle size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-red-700" />
      <p className="flex-1 text-body-s">{reason === "rate" ? t("rateLimited") : t("errorBanner")}</p>
      {reason !== "rate" && (
        <ButtonSecondary onClick={onRetry} className="shrink-0">
          {t("retry")}
        </ButtonSecondary>
      )}
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <ButtonPrimary type="submit" size="lg" arrow loading={busy} className="w-full sm:w-auto">
      {children}
    </ButtonPrimary>
  );
}

/** Replaces the form after a successful submission (UI §11.2). */
export function SuccessPanel() {
  const t = useTranslations("form");
  return (
    <div role="status" className="flex flex-col items-start gap-6 rounded-base border hairline p-8 md:p-12">
      <CheckCircle2 size={40} strokeWidth={1.25} aria-hidden className="text-red-500" />
      <p className="text-h3">{t("success")}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton />
        <ButtonSecondary size="lg" href="/">
          {t("backHome")}
        </ButtonSecondary>
      </div>
    </div>
  );
}
