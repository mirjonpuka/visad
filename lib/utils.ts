import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom font-size tokens so `text-h2` and
// `text-text-on-dark` are not treated as conflicting classes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-l",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-l",
            "body",
            "body-s",
            "eyebrow",
            "label",
            "stat",
          ],
        },
      ],
    },
  },
});

/**
 * Tags for polymorphic `as` props. Not React's ElementType: R3F adds the
 * three.js elements to JSX globally, which makes that union unusable.
 */
export type HtmlTag =
  | "div"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "p"
  | "span"
  | "ol"
  | "ul"
  | "li"
  | "dl"
  | "h1"
  | "h2"
  | "h3"
  | "h4";

/** Callback ref for an `as={HtmlTag}` element (a RefObject would need every tag's element type). */
export function htmlRef(ref: { current: HTMLElement | null }) {
  return (el: HTMLElement | null) => {
    ref.current = el;
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Localized field with fallback order: locale → en → sq (Architecture §3). */
export function pickLocale<T>(value: Partial<Record<string, T>> | undefined, locale: string) {
  if (!value) return undefined;
  return value[locale] ?? value.en ?? value.sq;
}
