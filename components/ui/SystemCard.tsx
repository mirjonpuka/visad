import { CMSImage } from "@/components/media/CMSImage";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { toSiteImage, type SystemCard as SystemCardData } from "@/sanity/lib/types";

/** System card (project "systems used", solution "recommended systems"): 16:10 image, name, line, arrow. */
export function SystemCard({
  system,
  label,
  className,
}: {
  system: SystemCardData;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={{ pathname: "/sistemet/[slug]", params: { slug: system.slug } }}
      className={cn("group flex flex-col", className)}
    >
      <div className="overflow-hidden rounded-base">
        <CMSImage
          image={toSiteImage(system.image)}
          ratio="16/10"
          sizes="(min-width: 1200px) 30vw, (min-width: 768px) 50vw, 100vw"
          shortNote
          imgClassName="transition-transform duration-(--dur-l) ease-out-expo group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="mt-5 text-h4">{system.title}</h3>
      {system.text && <p className="mt-2 line-clamp-2 text-body-s text-(--surface-fg-2)">{system.text}</p>}
      <span className="link-arrow mt-4 self-start font-mono text-label uppercase" aria-hidden>
        <span>{label}</span>
        <span className="link-arrow__arrow">→</span>
      </span>
    </Link>
  );
}
