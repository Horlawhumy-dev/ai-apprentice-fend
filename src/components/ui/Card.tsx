import type { HTMLAttributes, ReactNode } from "react";
import { toneText, type Tone } from "@/lib/ui";
import { Icon, type IconName } from "./Icon";

export function Card({
  as: Tag = "section",
  interactive = false,
  sheen = false,
  className = "",
  children,
  ...rest
}: {
  as?: "section" | "div" | "aside" | "article" | "li";
  interactive?: boolean;
  sheen?: boolean;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`glass rounded-2xl transition-all duration-300 ${
        interactive ? "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift" : ""
      } ${sheen ? "sheen-edge" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: IconName;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
          <Icon name={icon} size={17} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  icon?: IconName;
  tone?: Tone;
}) {
  return (
    <div className="glass-inset rounded-xl px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {icon && <Icon name={icon} size={14} className={toneText[tone]} />}
      </div>
      <p className="mt-1.5 text-lg font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

export function EmptyState({ icon = "search", title, hint }: { icon?: IconName; title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-surface-inset text-faint">
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default Card;
