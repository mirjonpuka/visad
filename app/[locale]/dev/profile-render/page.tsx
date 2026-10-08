import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { devRoutesEnabled } from "@/lib/dev";
import { ProfileRender } from "./ProfileRender";

export const metadata: Metadata = { title: "3D render", robots: { index: false, follow: false } };

/**
 * Dev-only (3D spec §Generating the static render): the scene at p = 0.5
 * (exploded), 2400×1600, with a PNG download. Convert with
 * `npm run profile:render` → public/brand/3d/profile-exploded(-1200).webp.
 */
export default function ProfileRenderPage() {
  if (!devRoutesEnabled) notFound();
  return (
    <div className="surface-dark bg-ink-900 pt-(--navbar-h)">
      <div className="site-container section-y">
        <h1 className="text-h3">Profile render (p = 0.5)</h1>
        <ProfileRender />
      </div>
    </div>
  );
}
