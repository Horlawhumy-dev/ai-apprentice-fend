"use client";

import { useEffect, useState } from "react";
import { confirmWorkflow, updateStep } from "@/services/api";
import type { WorkMap as Workflow, WorkflowStep as Step } from "@/types/workflow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, Stat } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/Field";
import { reviewTone, severityTone, toneDot, toneText, workflowTone, type Tone } from "@/lib/ui";

const reviewLabel: Record<string, string> = {
  proposed: "Proposed",
  confirmed: "Confirmed",
  rejected: "Rejected",
  uncertain: "Uncertain",
};

export default function WorkMapView({ workflowId }: { workflowId: string }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selected, setSelected] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${base}/api/workflows/${workflowId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Workflow not found");
        return res.json();
      })
      .then((data) => {
        if (active) setWorkflow(data);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [workflowId]);

  const review = async (step: Step, review_status: string) => {
    const updated = await updateStep(workflowId, step.id, { review_status });
    setWorkflow((wf) =>
      wf
        ? {
            ...wf,
            steps: wf.steps.map((s) => (s.id === step.id ? { ...s, review_status: updated.review_status } : s)),
          }
        : wf
    );
    setSelected((s) => (s && s.id === step.id ? { ...s, review_status: updated.review_status } : s));
  };

  const saveReason = async (step: Step, reason: string) => {
    const updated = await updateStep(workflowId, step.id, { reason });
    setWorkflow((wf) =>
      wf ? { ...wf, steps: wf.steps.map((s) => (s.id === step.id ? { ...s, reason: updated.reason } : s)) } : wf
    );
    setSelected((s) => (s && s.id === step.id ? { ...s, reason: updated.reason } : s));
  };

  const confirm = async () => {
    await confirmWorkflow(workflowId);
    setWorkflow((wf) => (wf ? { ...wf, status: "confirmed" } : wf));
  };

  if (loading)
    return (
      <Card className="flex items-center gap-3 p-6">
        <Icon name="loader" size={16} className="animate-spin text-brand" />
        <span className="text-sm text-muted">Loading Work Map…</span>
      </Card>
    );

  if (error)
    return (
      <Card className="flex items-center gap-3 border-bad/30 bg-bad-soft/40 p-6">
        <Icon name="alert" size={17} className="text-bad" />
        <span className="text-sm text-bad">{error}</span>
      </Card>
    );

  if (!workflow) return <EmptyState icon="map" title="No workflow" hint="This workflow has no steps yet." />;

  const status = workflow.status;
  const tone: Tone = workflowTone[status] ?? "warn";
  const confirmedCount = workflow.steps.filter((s) => s.review_status === "confirmed").length;
  const guardrailCount = workflow.steps.reduce((n, s) => n + (s.guardrails?.length ?? 0), 0);
  const avgConfidence =
    workflow.steps.reduce((n, s) => n + (typeof s.confidence === "number" ? s.confidence : 0), 0) /
    Math.max(workflow.steps.length, 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
      {/* Timeline */}
      <Card className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge tone={tone} className="mb-2.5">
              <Icon name={status === "confirmed" ? "checkCircle" : "clock"} size={12} />
              {status}
            </Badge>
            <h2 className="truncate text-xl font-semibold tracking-tight">{workflow.title}</h2>
          </div>
          <Button
            variant={status === "confirmed" ? "ok" : "primary"}
            icon={status === "confirmed" ? "check" : "shield"}
            disabled={status === "confirmed"}
            onClick={() => void confirm()}
          >
            {status === "confirmed" ? "Confirmed" : "Confirm workflow"}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Steps" value={workflow.steps.length} icon="listChecks" tone="brand" />
          <Stat label="Confirmed" value={`${confirmedCount}/${workflow.steps.length}`} icon="checkCircle" tone="ok" />
          <Stat label="Avg confidence" value={`${Math.round(avgConfidence * 100)}%`} icon="trending" />
        </div>

        {guardrailCount > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted">
            <Icon name="shield" size={13} className="text-warn" />
            {guardrailCount} guardrail{guardrailCount === 1 ? "" : "s"} inferred from this session
          </p>
        )}

        <ol className="relative mt-7 space-y-2.5">
          <span aria-hidden className="timeline-rail absolute top-3 bottom-6 left-[1.0625rem] w-px" />
          {workflow.steps.map((step, i) => {
            const active = selected?.id === step.id;
            const stepTone = reviewTone[step.review_status ?? "proposed"] ?? "neutral";
            const confidence = typeof step.confidence === "number" ? step.confidence : null;
            return (
              <li key={step.id} className="relative">
                <button
                  onClick={() => setSelected(step)}
                  aria-current={active}
                  className={`group relative z-10 flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                    active
                      ? "border-brand bg-brand-soft/50 shadow-lift"
                      : "border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface-3"
                  }`}
                >
                  <span
                    className={`grid size-[2.125rem] shrink-0 place-items-center rounded-xl border text-xs font-semibold tabular-nums transition-colors ${
                      active
                        ? "border-brand bg-brand text-brand-contrast"
                        : "border-line-strong bg-surface-3 text-faint"
                    }`}
                  >
                    {i + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium">{step.action}</span>
                      <span className="shrink-0 text-[0.68rem] text-faint tabular-nums">
                        {step.timestamp_ms}ms
                      </span>
                    </span>

                    {step.reason && (
                      <span className="mt-1.5 block truncate text-xs text-muted">{step.reason}</span>
                    )}

                    <span className="mt-2 flex flex-wrap items-center gap-2.5">
                      <Badge tone={stepTone} className="px-2 py-0.5 text-[0.68rem]">
                        {reviewLabel[step.review_status ?? "proposed"] ?? step.review_status}
                      </Badge>
                      {(step.guardrails?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[0.68rem] text-faint">
                          <Icon name="shield" size={11} />
                          {step.guardrails?.length}
                        </span>
                      )}
                      {confidence !== null && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1 w-12 overflow-hidden rounded-full bg-surface-inset">
                            <span
                              className={`block h-full rounded-full ${toneDot[confidence > 0.7 ? "ok" : "warn"]}`}
                              style={{ width: `${Math.round(confidence * 100)}%` }}
                            />
                          </span>
                          <span className="text-[0.68rem] text-faint tabular-nums">
                            {Math.round(confidence * 100)}%
                          </span>
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Inspector */}
      <Card className="h-fit p-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-2">
          <Icon name="search" size={16} className="text-brand" />
          <h2 className="text-base font-semibold tracking-tight">Step detail</h2>
        </div>

        {!selected ? (
          <EmptyState
            icon="target"
            title="Nothing selected"
            hint="Select a step in the timeline to review its evidence and confirm the rule."
          />
        ) : (
          <div className="animate-rise mt-5 space-y-5 text-sm">
            <div>
              <p className="eyebrow">Action</p>
              <p className="mt-1.5 font-medium">{selected.action}</p>
            </div>

            {selected.decision && (
              <div>
                <p className="eyebrow">Decision</p>
                <p className="mt-1.5 inline-flex items-center gap-2 font-medium text-brand-strong">
                  <Icon name="route" size={14} />
                  {selected.decision}
                </p>
              </div>
            )}

            <div>
              <p className="eyebrow">Reason</p>
              <Textarea
                defaultValue={selected.reason ?? ""}
                onBlur={(e) =>
                  selected && e.target.value !== (selected.reason ?? "")
                    ? void saveReason(selected, e.target.value)
                    : undefined
                }
                rows={3}
                placeholder="Add the expert's reason"
                aria-label="Expert reason"
                className="mt-1.5"
              />
              <p className="mt-1.5 text-[0.68rem] text-faint">Blurs to save automatically.</p>
            </div>

            {(selected.guardrails?.length ?? 0) > 0 && (
              <div>
                <p className="eyebrow">Guardrails</p>
                <ul className="mt-2 space-y-1.5">
                  {selected.guardrails?.map((g, i) => {
                    const gTone = severityTone[g.severity] ?? "neutral";
                    return (
                      <li key={i} className="glass-inset rounded-xl p-3">
                        <Badge tone={gTone} className="px-2 py-0.5 text-[0.68rem]">
                          {g.severity}
                        </Badge>
                        <p className="mt-1.5 leading-relaxed">{g.rule}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div>
              <p className="eyebrow">Evidence</p>
              {(selected.evidence?.transcript_excerpts?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {selected.evidence?.transcript_excerpts?.map((t) => (
                    <li key={t.id} className="glass-inset rounded-xl p-3 text-xs">
                      <span className="flex items-center gap-1.5 font-semibold capitalize">
                        <Icon name="user" size={11} className="text-brand" />
                        {t.speaker}
                      </span>
                      <p className="mt-1 leading-relaxed text-muted">{t.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              {selected.evidence && Object.keys(selected.evidence).length > 0 && (
                <pre className="scroll-thin mt-2 max-h-44 overflow-auto rounded-xl bg-surface-inset p-3 font-mono text-[0.68rem] leading-relaxed">
                  {JSON.stringify(selected.evidence, null, 2)}
                </pre>
              )}
            </div>

            <div className="border-t border-line pt-4">
              <p className="eyebrow mb-2.5">Review</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="ok" size="sm" icon="check" onClick={() => void review(selected, "confirmed")}>
                  Confirm
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon="x"
                  onClick={() => void review(selected, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="help"
                  onClick={() => void review(selected, "uncertain")}
                >
                  Mark uncertain
                </Button>
              </div>
              <p
                className={`mt-3 flex items-center gap-1.5 text-xs ${
                  toneText[reviewTone[selected.review_status ?? "proposed"]] ?? "text-muted"
                }`}
              >
                <Icon name="clock" size={12} />
                Currently {reviewLabel[selected.review_status ?? "proposed"] ?? "Proposed"}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
