/** wa.me link with an optional prefilled, localized message (UI §2.5). */
export function whatsappHref(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
