"use client";

import { useId, type ReactNode } from "react";
import { AlertCircle, Check, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/*
 * Form building blocks (UI §11.2): label above, hint, error below in red
 * with an icon (never colour only), aria-invalid + aria-describedby wiring.
 */

type FieldProps = {
  name: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Extra values for the error message (e.g. {max}) */
  errorValues?: Record<string, string | number>;
  className?: string;
  /** fieldset + legend for groups of controls */
  group?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

export function Field({ name, label, required, hint, error, errorValues, className, group, children }: FieldProps) {
  const t = useTranslations("form");
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const Wrapper = group ? "fieldset" : "div";
  const Label = group ? "legend" : "label";

  return (
    <Wrapper data-field={name} className={cn("min-w-0", className)}>
      <Label {...(group ? {} : { htmlFor: id })} className="mb-2 block text-body-s font-medium">
        {label}
        {required ? (
          <span className="text-red-700" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
        {required && <span className="sr-only"> ({t("required")})</span>}
      </Label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="mt-2 text-body-s text-(--surface-fg-3)">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          <AlertCircle size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
          {t(`errors.${error}` as "errors.required", errorValues ?? {})}
        </p>
      )}
    </Wrapper>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  name: string;
  label: ReactNode;
  value: string;
  onValue: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: ReactNode;
};

export function TextField({ name, label, value, onValue, onBlur, error, hint, required, className, ...rest }: InputProps) {
  return (
    <Field name={name} label={label} required={required} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className="field-input"
          {...rest}
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  name,
  label,
  value,
  onValue,
  onBlur,
  error,
  hint,
  required,
  className,
  rows = 5,
  placeholder,
}: Omit<InputProps, "type"> & { rows?: number }) {
  return (
    <Field name={name} label={label} required={required} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onValue(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="field-input"
        />
      )}
    </Field>
  );
}

/** Chips: multiple (checkbox semantics) or single (radio semantics). */
export function ChoiceChips<T extends string>({
  name,
  label,
  options,
  value,
  onValue,
  multiple,
  error,
  required,
  className,
}: {
  name: string;
  label: ReactNode;
  options: { value: T; label: string }[];
  value: T[] | T | "";
  onValue: (value: T[] | T) => void;
  multiple?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  const selected = (v: T) => (multiple ? (value as T[]).includes(v) : value === v);
  return (
    <Field name={name} label={label} error={error} required={required} className={className} group>
      {({ describedBy }) => (
        <div className="flex flex-wrap gap-2" role={multiple ? "group" : "radiogroup"} aria-describedby={describedBy}>
          {options.map((option) => {
            const on = selected(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => {
                  if (multiple) {
                    const list = value as T[];
                    onValue(on ? list.filter((v) => v !== option.value) : [...list, option.value]);
                  } else onValue(option.value);
                }}
                className="chip"
              >
                {on && multiple && <Check size={14} strokeWidth={2} aria-hidden />}
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </Field>
  );
}

export function Stepper({
  name,
  label,
  value,
  onValue,
  min = 1,
  max = 999,
  error,
  labels,
}: {
  name: string;
  label: ReactNode;
  value: number;
  onValue: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
  labels: { decrease: string; increase: string };
}) {
  return (
    <Field name={name} label={label} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="flex h-[52px] w-44 items-stretch rounded-base border hairline">
          <button
            type="button"
            aria-label={labels.decrease}
            onClick={() => onValue(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex w-12 items-center justify-center disabled:opacity-40"
          >
            <Minus size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <input
            id={id}
            name={name}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={Number.isFinite(value) ? value : ""}
            onChange={(e) => onValue(e.target.value === "" ? Number.NaN : Number(e.target.value))}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className="w-full min-w-0 border-x hairline bg-transparent text-center font-mono tabular [appearance:textfield] focus-visible:outline-2 focus-visible:outline-red-500 [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label={labels.increase}
            onClick={() => onValue(Math.min(max, (Number.isFinite(value) ? value : 0) + 1))}
            disabled={value >= max}
            className="flex w-12 items-center justify-center disabled:opacity-40"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      )}
    </Field>
  );
}

export function ConsentField({
  value,
  onValue,
  error,
}: {
  value: boolean;
  onValue: (value: boolean) => void;
  error?: string;
}) {
  const t = useTranslations("form");
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div data-field="consent">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(e) => onValue(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          aria-required
          className="mt-0.5 h-5 w-5 shrink-0 accent-red-600"
        />
        <label htmlFor={id} className="text-body-s">
          {t("consent")}
          <span className="text-red-700" aria-hidden>
            {" "}
            *
          </span>{" "}
          <Link href="/privatesia" target="_blank" className="underline underline-offset-4">
            {t("privacyLink")}
          </Link>
        </label>
      </div>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          <AlertCircle size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
          {t(`errors.${error}` as "errors.consent")}
        </p>
      )}
    </div>
  );
}
