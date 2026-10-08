import { getTranslations } from "next-intl/server";
import { CMSImage } from "@/components/media/CMSImage";
import { stockImage } from "@/lib/images";

type Step = { title?: string | null; text?: string | null };

/**
 * Systems part A (UI §3.3A) — static fallback layout: image + the 5 steps as
 * a list. Phase 6 replaces this with the pinned WebGL scene on capable
 * devices; phones, low-power devices and reduced motion keep this layout with
 * the exported render (brand/3d/profile-exploded.webp).
 */
export async function ProfileStory({ title, steps }: { title?: string | null; steps: Step[] }) {
  const t = await getTranslations("home");

  return (
    <div className="grid-12 gap-y-12">
      <div className="col-span-12 lg:col-span-5">
        <p className="font-mono text-eyebrow text-text-on-dark-3 uppercase">{t("systemsEyebrow")}</p>
        {title && <h2 className="mt-5 text-h2 text-balance">{title}</h2>}

        <ol className="relative mt-12 flex flex-col gap-8 pl-8">
          {/* Vertical progress line; the red fill follows scroll progress in Phase 6 */}
          <span aria-hidden className="absolute top-1 bottom-1 left-0 w-px bg-line-dark" />
          {steps.map((step, i) => (
            <li key={i} className="flex flex-col gap-1.5">
              <span className="font-mono text-label text-red-text-on-dark tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-h4">{step.title}</h3>
              {step.text && <p className="max-w-[440px] text-body-s text-text-on-dark-2">{step.text}</p>}
            </li>
          ))}
        </ol>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <CMSImage
          image={stockImage("stock-profile-story")}
          ratio="4/3"
          sizes="(min-width: 1440px) 760px, (min-width: 1024px) 56vw, 100vw"
        />
      </div>
    </div>
  );
}
