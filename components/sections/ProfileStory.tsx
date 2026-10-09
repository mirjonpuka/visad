import { getTranslations } from "next-intl/server";
import { ProfileStoryClient } from "./ProfileStoryClient";

type Step = { title?: string | null; text?: string | null };

/**
 * Systems part A (UI §3.3A, owner feedback: a full window). The still render
 * (transparent WebP, exported from the same scene by `npm run profile:render`)
 * is the poster and the version for phones / reduced motion.
 */
export async function ProfileStory({ title, steps }: { title?: string | null; steps: Step[] }) {
  const t = await getTranslations("home");
  return (
    <ProfileStoryClient
      eyebrow={t("systemsEyebrow")}
      title={title}
      steps={steps}
      poster={{ src: "/brand/3d/window.webp", alt: t("profileRenderAlt") }}
      labels={{ finish: t("finish"), silver: t("finishSilver"), anthracite: t("finishAnthracite") }}
    />
  );
}
