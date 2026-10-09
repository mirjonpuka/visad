import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveals";
import { StatIcon } from "@/components/ui/StatIcon";

type Stat = { value: string; label?: string | null };

const ICONS = ["building", "calendar", "globe"] as const;

/**
 * Stats band (UI §3.2), static (owner request): each number with a small
 * isometric icon, 3 columns with vertical hairlines on laptop, stacked on
 * phone. Values from siteSettings.stats, [TO CONFIRM] until confirmed.
 */
export async function StatsBand({ stats }: { stats: Stat[] }) {
  const t = await getTranslations("home");
  if (!stats.length) return null;

  return (
    <section aria-label={t("statsLabel")} className="surface-dark border-t border-line-dark">
      <div className="site-container">
        <Reveal as="ul" stagger className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, i) => (
            <li
              key={i}
              className="flex items-center gap-5 border-line-dark py-8 md:px-8 md:py-12 md:first:pl-0 [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-t-0 md:[&:not(:first-child)]:border-l"
            >
              <StatIcon kind={ICONS[i % ICONS.length]} size={64} />
              <p className="flex flex-col gap-1.5">
                <span className="text-stat leading-none tabular">{stat.value}</span>
                <span className="text-body-s text-text-on-dark-2">{stat.label}</span>
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
