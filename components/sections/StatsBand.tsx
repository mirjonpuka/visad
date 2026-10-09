import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveals";
import { StatIcon } from "@/components/ui/StatIcon";
import { cn } from "@/lib/utils";

type Stat = { value: string; label?: string | null };

const ICONS = ["building", "notebook", "map"] as const;

/**
 * Stats band (UI §3.2, owner brief C2/D1) — used on Home and on the Factory
 * page. Each column centred: line icon, number (static — owner: no counter),
 * label. Values from the CMS, [TO CONFIRM] until the client confirms them.
 */
export async function StatsBand({ stats, className }: { stats: Stat[]; className?: string }) {
  const t = await getTranslations("home");
  if (!stats.length) return null;
  const cols = stats.length >= 4 ? "md:grid-cols-2 laptop:grid-cols-4" : "md:grid-cols-3";

  return (
    <section aria-label={t("statsLabel")} className={cn("surface-dark border-t border-line-dark", className)}>
      <div className="site-container">
        <Reveal as="ul" stagger className={cn("grid grid-cols-1", cols)}>
          {stats.map((stat, i) => (
            <li
              key={i}
              className="flex flex-col items-center justify-center gap-3 border-line-dark py-10 text-center md:py-14 [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-t-0 md:[&:not(:first-child)]:border-l"
            >
              <StatIcon kind={ICONS[i % ICONS.length]} size={40} />
              <p className="flex flex-col items-center gap-1.5">
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
