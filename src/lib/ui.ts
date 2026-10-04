export type Tone = "brand" | "ok" | "warn" | "bad" | "info" | "neutral";

export const toneBadge: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-strong",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-inset text-muted",
};

export const toneDot: Record<Tone, string> = {
  brand: "bg-brand",
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
  info: "bg-info",
  neutral: "bg-faint",
};

export const toneText: Record<Tone, string> = {
  brand: "text-brand",
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
  info: "text-info",
  neutral: "text-faint",
};

/** Session lifecycle: created → capturing → paused/off_record → finished. */
export const sessionTone: Record<string, Tone> = {
  created: "neutral",
  capturing: "ok",
  paused: "warn",
  off_record: "bad",
  finished: "info",
  failed: "bad",
};

export const sessionLabel: Record<string, string> = {
  created: "Ready",
  capturing: "Capturing",
  paused: "Paused",
  off_record: "Off record",
  finished: "Finished",
  failed: "Failed",
};

/** Only `capturing` should look "alive" in the UI. */
export const sessionLive = (status: string) => status === "capturing";

/** Work Map workflow status. */
export const workflowTone: Record<string, Tone> = {
  proposed: "warn",
  draft: "warn",
  confirmed: "ok",
  rejected: "bad",
};

/** Per-step expert review status inside a Work Map. */
export const reviewTone: Record<string, Tone> = {
  proposed: "neutral",
  confirmed: "ok",
  rejected: "bad",
  uncertain: "warn",
};

/** Guardrail severity. */
export const severityTone: Record<string, Tone> = {
  info: "info",
  warn: "warn",
  block: "bad",
};
