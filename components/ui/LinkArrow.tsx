import type { MouseEventHandler, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { AppHref } from "./Button";

type Props = {
  children: ReactNode;
  className?: string;
  /** Mono uppercase label style (used in accordions, cards) */
  mono?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "data-force"?: string;
} & (
  | { href: AppHref; externalHref?: never; download?: never }
  | { externalHref: string; href?: never; download?: boolean | string }
);

/** Text + "→" with a 1px underline 4px below (UI §2.6, Motion §5.3). */
export function LinkArrow({ children, className, mono, ...rest }: Props) {
  const classes = cn(
    "link-arrow",
    mono ? "font-mono text-label uppercase" : "text-body-s font-medium",
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <span className="link-arrow__arrow" aria-hidden>
        →
      </span>
    </>
  );

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {inner}
      </Link>
    );
  }
  const { externalHref, ...aRest } = rest;
  return (
    <a href={externalHref} className={classes} {...aRest}>
      {inner}
    </a>
  );
}
