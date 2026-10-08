"use client";

import { useCallback, useState } from "react";
import type { z } from "zod";

/**
 * Minimal form state for the lead forms: values, per-field validation on blur
 * (UI §11.2 "inline, on blur") with the shared zod schema, whole-schema
 * validation on step/submit. Values are never cleared on error.
 */
export function useFormState<S extends z.ZodObject>(schema: S, initial: z.input<S>) {
  type Values = z.input<S>;
  type Key = keyof Values & string;
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});

  const validateField = useCallback(
    (key: Key, value: unknown) => {
      const field = (schema.shape as Record<string, z.ZodType>)[key];
      if (!field) return true;
      const result = field.safeParse(value);
      setErrors((prev) => ({ ...prev, [key]: result.success ? undefined : result.error.issues[0]?.message }));
      return result.success;
    },
    [schema],
  );

  const set = useCallback(
    <K extends Key>(key: K, value: Values[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // Once a field shows an error, re-check it while typing so it clears
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const field = (schema.shape as Record<string, z.ZodType>)[key];
        const ok = field?.safeParse(value).success;
        return ok ? { ...prev, [key]: undefined } : prev;
      });
    },
    [schema],
  );

  /** Validate the given keys (a step) or the whole schema; focuses the first invalid field. */
  const validate = useCallback(
    (keys?: Key[]) => {
      const shape = schema.shape as Record<string, z.ZodType>;
      const list = (keys ?? (Object.keys(shape) as Key[])).filter((k) => shape[k]);
      const next: Partial<Record<Key, string>> = {};
      for (const key of list) {
        const result = shape[key].safeParse((values as Record<string, unknown>)[key]);
        if (!result.success) next[key] = result.error.issues[0]?.message;
      }
      setErrors((prev) => ({ ...prev, ...Object.fromEntries(list.map((k) => [k, next[k]])) }));
      const first = list.find((k) => next[k]);
      if (first) {
        requestAnimationFrame(() => {
          const el = document.querySelector<HTMLElement>(`[data-field="${first}"] :is(input,textarea,select,button)`);
          el?.focus();
        });
      }
      return !first;
    },
    [schema, values],
  );

  return {
    values,
    errors,
    set,
    blur: (key: Key) => validateField(key, (values as Record<string, unknown>)[key]),
    validate,
    setErrors: (fields: Record<string, string>) => setErrors((prev) => ({ ...prev, ...fields })),
  };
}
