import { getTranslations } from "next-intl/server";

/** "Kalo te përmbajtja": the first focusable element on every page (UI §15). */
export async function SkipLink() {
  const t = await getTranslations();
  return (
    <a
      href="#main"
      className="fixed top-3 left-3 z-[100] -translate-y-[200%] rounded-base bg-red-600 px-4 py-3 text-body-s font-medium text-white focus-visible:translate-y-0"
    >
      {t("skip")}
    </a>
  );
}
