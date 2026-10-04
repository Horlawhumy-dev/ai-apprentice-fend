import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "ghost" | "soft" | "danger" | "ok";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  soft: "btn-soft",
  danger: "btn-danger",
  ok: "btn-ok",
};

const sizeClass: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  iconFilled?: boolean;
  busy?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "ghost",
  size = "md",
  icon,
  iconRight,
  iconFilled = false,
  busy = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || busy}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {busy ? (
        <Icon name="loader" size={size === "sm" ? 13 : 15} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={size === "sm" ? 13 : 15} filled={iconFilled} />
      )}
      {children}
      {iconRight && !busy && <Icon name={iconRight} size={size === "sm" ? 13 : 15} />}
    </button>
  );
}

export default Button;
