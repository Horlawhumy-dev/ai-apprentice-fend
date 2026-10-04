"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createApprenticeSession,
  evaluateAction,
  finishApprenticeSession,
} from "@/services/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState, Stat } from "@/components/ui/Card";
import { Field, FieldRow, Select } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import PageShell, { PageHeader } from "@/components/ui/PageShell";

interface TutorResult {
  allowed: boolean;
  matched_rule_id?: string | null;
  severity: string;
  explanation: string;
  evidence_step_id?: string | null;
  evidence?: {
    action: string;
    reason: string | null;
    timestamp_ms: number;
    guardrails: unknown[];
  } | null;
  next_question?: string | null;
  attempt_id?: string;
}

interface CaseData {
  case_id: string;
  title: string;
  supplier: string;
  amount: number;
  proposed_cost_center: string;
  required_asset_number: boolean;
  note: string;
}

export default function ApprenticePage() {
  const [workflowId, setWorkflowId] = useState("");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [costCenter, setCostCenter] = useState("CAPEX");
  const [assetNumber, setAssetNumber] = useState("");
  const [result, setResult] = useState<TutorResult | null>(null);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const wf = params.get("workflow");
      if (wf) setWorkflowId(wf);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const startCase = async (wfId: string) => {
    try {
      setError(null);
      setBusy(true);
      const created = await createApprenticeSession(wfId, "case_alpha");
      setSessionId(created.id);
      setCaseData(created.case);
      setCostCenter(created.case.proposed_cost_center);
      setAssetNumber("");
      setResult(null);
      setSummary(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start case. Is the workflow confirmed?");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!sessionId || !caseData) return;
    setBusy(true);
    try {
      setResult(await evaluateAction(sessionId, "save_attempted", {
        cost_center: costCenter,
        amount: caseData.amount,
        asset_number: assetNumber,
      }));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!sessionId) return;
    setBusy(true);
    try {
      setSummary(await finishApprenticeSession(sessionId));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="AI Apprentice / Practise"
        title="Apprentice Training"
        description="Take a fresh case that your expert never saw. The tutor will coach you using only the rules they confirmed."
      />

      {!sessionId && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)]">
          <Card className="p-6 sm:p-7">
            <CardHeader
              icon="key"
              title="Start a training case"
              subtitle="Paste the workflow ID from a confirmed Work Map to begin."
            />

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (workflowId) void startCase(workflowId);
              }}
            >
              <FieldRow label="Confirmed workflow ID" htmlFor="workflow-id">
                <Field
                  id="workflow-id"
                  value={workflowId}
                  onChange={(e) => setWorkflowId(e.target.value)}
                  placeholder="Paste the workflow UUID from the Work Map"
                  className="font-mono"
                />
              </FieldRow>

              <Button
                type="submit"
                variant="primary"
                icon="play"
                iconFilled
                busy={busy}
                disabled={!workflowId.trim()}
                className="mt-5"
              >
                Start training case
              </Button>

              {error && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
                  <Icon name="alert" size={15} />
                  {error}
                </p>
              )}
            </form>

            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <Icon name="lightbulb" size={15} className="text-warn" />
              <p className="text-xs text-muted">
                No confirmed map handy?{" "}
                <Link
                  href="/work-map/demo"
                  className="font-medium text-brand-strong underline underline-offset-2"
                >
                  Review a Work Map first
                </Link>
                .
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
            <CardHeader icon="shield" title="How coaching works" />
            <ul className="mt-5 space-y-3.5">
              {[
                { icon: "listChecks" as IconName, text: "Every step you take is checked against confirmed rules." },
                { icon: "message" as IconName, text: "Risks come back with the expert's original reasoning attached." },
                { icon: "graduation" as IconName, text: "Confirmed rules become guardrails for the next trainee." },
              ].map((item) => (
                <li key={item.text} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-inset text-brand">
                    <Icon name={item.icon} size={15} />
                  </span>
                  <p className="text-sm leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {caseData && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
          <Card className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Badge tone="brand" className="mb-2.5">
                  <Icon name="clipboard" size={12} />
                  {caseData.case_id}
                </Badge>
                <h2 className="text-xl font-semibold tracking-tight">{caseData.title}</h2>
              </div>
              {sessionId && (
                <Button variant="ghost" size="sm" icon="refresh" onClick={() => {
                  setSessionId(null);
                  setCaseData(null);
                  setResult(null);
                  setSummary(null);
                }}>
                  New case
                </Button>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Stat label="Supplier" value={caseData.supplier} icon="building" />
              <Stat label="Amount" value={`$${caseData.amount.toLocaleString()}`} icon="trending" tone="brand" />
            </div>

            {caseData.note && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-warn-soft px-3.5 py-2.5 text-sm text-warn">
                <Icon name="alert" size={15} className="mt-0.5" />
                {caseData.note}
              </p>
            )}

            <div className="mt-6 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
              <FieldRow label="Cost center" htmlFor="cost-center">
                <Select
                  id="cost-center"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                >
                  <option value="OPEX">OPEX</option>
                  <option value="CAPEX">CAPEX</option>
                </Select>
              </FieldRow>

              <FieldRow
                label="Asset number"
                htmlFor="asset-number"
                hint={caseData.required_asset_number ? "Required for this case" : "Optional"}
              >
                <Field
                  id="asset-number"
                  value={assetNumber}
                  onChange={(e) => setAssetNumber(e.target.value)}
                  placeholder="A-1001"
                  className="font-mono"
                />
              </FieldRow>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-line pt-5">
              <Button variant="primary" icon="check" busy={busy} onClick={() => void save()}>
                Save
              </Button>
              <Button variant="ghost" icon="stop" busy={busy} onClick={() => void finish()}>
                Finish case
              </Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <CardHeader
                icon="message"
                title="Tutor"
                subtitle="Coaching is grounded in expert-confirmed rules and links back to the evidence moment."
              />
              <div className="mt-4">
                {!result && !summary && (
                  <EmptyState
                    icon="sparkles"
                    title="No feedback yet"
                    hint="Choose a cost center and save to see how your decision compares to the expert's."
                  />
                )}

                {result && <Verdict result={result} workflowId={workflowId} />}

                {summary && (
                  <div className="animate-rise glass-inset rounded-xl p-4">
                    <p className="eyebrow">Session summary</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Attempts", value: summary.attempts, tone: "text-ink" },
                        { label: "Allowed", value: summary.allowed, tone: "text-ok" },
                        { label: "Blocked", value: summary.blocked, tone: "text-bad" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg bg-surface-2 py-2.5">
                          <p className={`text-lg font-semibold tabular-nums ${s.tone}`}>{s.value ?? 0}</p>
                          <p className="mt-0.5 text-[0.65rem] text-faint uppercase">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Verdict({ result, workflowId }: { result: TutorResult; workflowId: string }) {
  const verdict: { tone: "ok" | "warn" | "bad"; label: string; icon: IconName } = result.allowed
    ? { tone: "ok", label: "Allowed", icon: "checkCircle" }
    : result.severity === "warn"
      ? { tone: "warn", label: "Reconsider", icon: "alert" }
      : { tone: "bad", label: "Blocked", icon: "xCircle" };

  const shell =
    verdict.tone === "ok"
      ? "border-ok/30 bg-ok-soft/50"
      : verdict.tone === "warn"
        ? "border-warn/30 bg-warn-soft/50"
        : "border-bad/30 bg-bad-soft/50";

  const iconTone = verdict.tone === "ok" ? "text-ok" : verdict.tone === "warn" ? "text-warn" : "text-bad";

  return (
    <div className={`animate-rise rounded-xl border p-4 ${shell}`}>
      <div className="flex items-center gap-2.5">
        <Icon name={verdict.icon} size={19} className={iconTone} />
        <p className="font-semibold">{verdict.label}</p>
        {result.matched_rule_id && (
          <Badge tone="neutral" className="ml-auto">
            <Icon name="shield" size={11} />
            rule
          </Badge>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed">{result.explanation}</p>

      {result.next_question && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-surface-2/70 p-3 text-sm italic">
          <Icon name="message" size={14} className="mt-0.5 shrink-0 text-brand" />
          {result.next_question}
        </p>
      )}

      {result.evidence && (
        <div className="glass-inset mt-3 rounded-xl p-3">
          <p className="eyebrow flex items-center gap-1.5">
            <Icon name="user" size={11} />
            Expert evidence
          </p>
          <p className="mt-1.5 text-sm font-medium">{result.evidence.action}</p>
          {result.evidence.reason && (
            <p className="mt-1 text-xs leading-relaxed text-muted">{result.evidence.reason}</p>
          )}
          <p className="mt-1 text-[0.65rem] text-faint tabular-nums">
            at {result.evidence.timestamp_ms}ms
          </p>
          {workflowId && (
            <Link
              href={`/work-map/${workflowId}`}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-brand-strong underline underline-offset-2"
            >
              Open Work Map
              <Icon name="arrowRight" size={12} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
