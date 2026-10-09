import { CMSImage } from "@/components/media/CMSImage";
import { Link } from "@/i18n/navigation";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  slug: string;
  meta: string;
  image: SiteImage | null;
  number: string;
  viewLabel: string;
  sizes: string;
  /** Above-the-fold tile (projects index): eager + high priority */
  priority?: boolean;
  className?: string;
};

/**
 * Project tile (UI §3.4): full-bleed image, bottom gradient, name + meta
 * bottom-left, Mono number top-right. Hover (laptop): image 1.04, overlay
 * darkens, "Shiko projektin →" slides up 12px (Motion §5.5).
 */
export function ProjectTile({ title, slug, meta, image, number, viewLabel, sizes, priority, className }: Props) {
  return (
    <Link
      href={{ pathname: "/projektet/[slug]", params: { slug } }}
      className={cn("group relative block overflow-hidden rounded-base bg-ink-700", className)}
      data-cursor="view"
    >
      <CMSImage
        image={image}
        fill
        sizes={sizes}
        priority={priority}
        // Under a gradient and a title: q65 looks the same and is ~40% lighter (A2)
        quality={65}
        imgClassName="transition-transform duration-(--dur-l) ease-out-expo group-hover:scale-[1.04]"
        className="rounded-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-[rgba(14,15,17,0.7)] transition-opacity duration-(--dur-l) ease-out-expo"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[rgba(14,15,17,0.15)] opacity-0 transition-opacity duration-(--dur-l) ease-out-expo group-hover:opacity-100"
      />
      <span className="absolute top-5 right-5 font-mono text-label text-text-on-dark tabular">{number}</span>
      <div className="absolute inset-x-6 bottom-6 text-text-on-dark">
        <h3 className="text-h4">{title}</h3>
        {meta && <p className="mt-1 text-body-s text-text-on-dark-2">{meta}</p>}
        <p
          aria-hidden
          className="mt-3 flex translate-y-3 items-center gap-2 font-mono text-label uppercase opacity-0 transition-[opacity,translate] duration-(--dur-m) ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          {viewLabel} <span>→</span>
        </p>
      </div>
    </Link>
  );
}
