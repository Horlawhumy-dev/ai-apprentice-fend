import type { ReactNode } from "react";
import { sessionLabel, sessionLive, sessionTone, toneBadge, toneDot, type Tone } from "@/lib/ui";

export function Badge({
  tone = "neutral",
  pulse = false,
  className = "",
  children,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight whitespace-nowrap ${toneBadge[tone]} ${className}`}
    >
      {pulse && <span className={`size-1.5 shrink-0 rounded-full ${toneDot[tone]}`} />}
      {children}
    </span>
  );
}

export function StatusDot({ tone = "neutral", pulse = false }: { tone?: Tone; pulse?: boolean }) {
  return (
    <span className="relative flex size-2 shrink-0">
      {pulse && (
        <span className={`absolute inline-flex size-full animate-halo rounded-full ${toneDot[tone]}`} />
      )}
      <span className={`relative inline-flex size-2 rounded-full ${toneDot[tone]}`} />
    </span>
  );
}

/** Session pill — the halo only animates while actively capturing. */
export function SessionBadge({ status }: { status: string }) {
  const tone = sessionTone[status] ?? "neutral";
  const live = sessionLive(status);
  return (
    <Badge tone={tone} pulse={live}>
      <StatusDot tone={tone} pulse={live} />
      {sessionLabel[status] ?? status}
    </Badge>
  );
}

export type { Tone };
export default Badge;
