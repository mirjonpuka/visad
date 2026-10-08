import type { ButtonHTMLAttributes, ComponentProps, MouseEventHandler, ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type AppHref = ComponentProps<typeof Link>["href"];

type Variant = "primary" | "secondary" | "whatsapp";

type CommonProps = {
  size?: "md" | "lg";
  /** Trailing "→" that shifts 4px on hover */
  arrow?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Force the secondary button's colours when it is not inside a surface */
  surface?: "dark" | "light";
  className?: string;
  children: ReactNode;
  /** Dev kit only: render a state statically ("hover", "active", "focus") */
  "data-force"?: string;
};

type LinkExtras = {
  title?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
};
type AsInternalLink = CommonProps & LinkExtras & { href: AppHref; externalHref?: never };
type AsExternalLink = CommonProps &
  LinkExtras & {
    externalHref: string;
    href?: never;
    newTab?: boolean;
  };
type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled"> & {
    href?: never;
    externalHref?: never;
  };

export type ButtonProps = AsInternalLink | AsExternalLink | AsButton;

function ButtonBase({ variant, icon, props }: { variant: Variant; icon?: ReactNode; props: ButtonProps }) {
  const {
    size = variant === "whatsapp" ? "lg" : "md",
    arrow,
    loading,
    disabled,
    surface,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    surface && `surface-${surface} bg-transparent`,
    className,
  );
  const inner = (
    <>
      {variant === "secondary" && <span className="btn__fill" aria-hidden />}
      <span className="btn__label">
        {icon}
        {children}
        {arrow && (
          <span className="btn__arrow" aria-hidden>
            →
          </span>
        )}
      </span>
      <span className="btn__spinner" aria-hidden />
    </>
  );
  const state = {
    "data-loading": loading ? "" : undefined,
    "aria-busy": loading || undefined,
    // Large buttons are magnetic on laptop (Motion §5.2, wired in Phase 5)
    "data-magnetic": size === "lg" ? "" : undefined,
  };

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as AsInternalLink;
    return (
      <Link
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...state}
        {...linkRest}
      >
        {inner}
      </Link>
    );
  }

  if ("externalHref" in rest && rest.externalHref !== undefined) {
    const { externalHref, newTab, ...linkRest } = rest as AsExternalLink;
    return (
      <a
        href={externalHref}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...state}
        {...linkRest}
      >
        {inner}
      </a>
    );
  }

  const { type = "button", ...buttonRest } = rest as AsButton;
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...state}
      {...buttonRest}
      onClick={loading ? undefined : buttonRest.onClick}
    >
      {inner}
    </button>
  );
}

export function ButtonPrimary(props: ButtonProps) {
  return <ButtonBase variant="primary" props={props} />;
}

export function ButtonSecondary(props: ButtonProps) {
  return <ButtonBase variant="secondary" props={props} />;
}

export function ButtonWhatsApp(props: ButtonProps) {
  return (
    <ButtonBase
      variant="whatsapp"
      icon={<MessageCircle size={20} strokeWidth={1.5} aria-hidden />}
      props={props}
    />
  );
}
