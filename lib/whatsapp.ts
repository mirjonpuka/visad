import { contact } from "./site";

/** wa.me link with a prefilled, localized message (UI §2.5). */
export function whatsappHref(message?: string, number = contact.whatsappNumber) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
