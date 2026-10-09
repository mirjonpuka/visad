import Image from "next/image";
import { CMSImage } from "@/components/media/CMSImage";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Official ALUMIL logo as a transparent PNG (owner request), rendered from the official SVG */
export const ALUMIL_LOGO_SRC = "/brand/partners/alumil-logo.png";
const RATIO = 220 / 84.73;

/**
 * ALUMIL partner logo. Uses the logo uploaded in Sanity if there is one,
 * otherwise the official SVG. Never recoloured: on dark backgrounds pass
 * `tile` so it sits on a light alu surface (DECISIONS D4.16).
 */
export function AlumilLogo({
  cmsLogo,
  width,
  tile = false,
  className,
}: {
  cmsLogo?: SiteImage | null;
  width: number;
  tile?: boolean;
  className?: string;
}) {
  const logo = cmsLogo ? (
    <div style={{ width }}>
      <CMSImage image={cmsLogo} sizes={`${width}px`} className="rounded-none bg-transparent" />
    </div>
  ) : (
    <Image
      src={ALUMIL_LOGO_SRC}
      alt="ALUMIL"
      width={width}
      height={Math.round(width / RATIO)}
      className="h-auto"
      style={{ width }}
    />
  );

  return tile ? (
    <span className={cn("inline-flex rounded-base bg-alu-100 px-3 py-2.5", className)}>{logo}</span>
  ) : (
    <span className={cn("inline-flex", className)}>{logo}</span>
  );
}
