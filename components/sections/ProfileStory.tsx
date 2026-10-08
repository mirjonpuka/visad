import { getTranslations } from "next-intl/server";
import type { SiteImage } from "@/lib/images";
import { ProfileStoryClient } from "./ProfileStoryClient";

type Step = { title?: string | null; text?: string | null };

/**
 * Systems part A (UI §3.3A, 3D spec). Static render exported from the same
 * scene (/dev/profile-render, p = 0.5) for phones, low-power devices, reduced
 * motion and as the poster while the WebGL scene loads.
 */
export async function ProfileStory({ title, steps }: { title?: string | null; steps: Step[] }) {
  const t = await getTranslations("home");
  const image: SiteImage = {
    sources: [
      { src: "/brand/3d/profile-exploded-1200.webp", width: 1200, height: 800 },
      { src: "/brand/3d/profile-exploded.webp", width: 2400, height: 1600 },
    ],
    alt: t("profileRenderAlt"),
  };

  return (
    <ProfileStoryClient
      eyebrow={t("systemsEyebrow")}
      title={title}
      steps={steps}
      image={image}
      labels={{ finish: t("finish"), silver: t("finishSilver"), anthracite: t("finishAnthracite") }}
    />
  );
}
