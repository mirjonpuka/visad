import { getTranslations } from "next-intl/server";
import { CountUp, Reveal } from "@/components/motion/reveals";

type Stat = { value: string; label?: string | null };

/**
 * Stats band (UI §3.2): 3 columns with vertical hairlines (laptop), stacked
 * with horizontal hairlines on phone. Numbers count up when in view (Motion §4.6).
 * Values from siteSettings.stats, [TO CONFIRM] until the client confirms them.
 */
export async function StatsBand({ stats }: { stats: Stat[] }) {
  const t = await getTranslations("home");
  if (!stats.length) return null;

  return (
    <section aria-label={t("statsLabel")} className="surface-dark border-t border-line-dark">
      <div className="site-container">
        <Reveal as="dl" stagger className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 border-line-dark py-10 md:px-10 md:py-14 md:first:pl-0 [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-t-0 md:[&:not(:first-child)]:border-l"
            >
              <dt className="order-2 text-body-s text-text-on-dark-2">{stat.label}</dt>
              <dd className="order-1 text-stat">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
