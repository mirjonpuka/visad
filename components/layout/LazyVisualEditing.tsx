"use client";

import dynamic from "next/dynamic";

/**
 * Click-to-edit overlays for the Presentation tool. Loaded only when Draft
 * Mode renders it, so it never weighs on the public first-load bundle.
 */
export const LazyVisualEditing = dynamic(
  () => import("next-sanity/visual-editing").then((m) => m.VisualEditing),
  { ssr: false },
);
