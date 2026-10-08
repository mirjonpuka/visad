import { notFound } from "next/navigation";

// This segment only ever renders the 404, so there is nothing to validate for
// instant navigation (Next 16.4 dev insight otherwise reports it).
export const instant = false;

// Unknown paths under a locale render the localized 404 inside the site layout.
export default function CatchAll() {
  notFound();
}
