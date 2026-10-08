import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DraftModeBanner } from "./DraftModeBanner";

/**
 * In Draft Mode (Presentation tool): click-to-edit overlays + a small banner
 * to leave preview. Rendered inside <Suspense> so the static shell is unaffected.
 */
export async function DraftModeTools() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <VisualEditing />
      <DraftModeBanner />
    </>
  );
}
