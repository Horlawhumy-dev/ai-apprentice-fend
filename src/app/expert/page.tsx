"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScreenSharePreview from "@/components/capture/ScreenSharePreview";
import CaptureControls from "@/components/capture/CaptureControls";
import DebriefPanel from "@/components/capture/DebriefPanel";
import InstrumentationCard from "@/components/capture/InstrumentationCard";
import AgentPanel from "@/components/voice-agent/AgentPanel";
import { useCaptureState } from "@/hooks/useCaptureState";
import {
  setSession as setStoreSession,
  setStatus as setStoreStatus,
  setEventStats,
} from "@/services/captureStore";
import {
  createSession,
  getSession,
  startCapture,
  pauseSession,
  offRecord,
  resumeSession,
  finishSession,
  generateWorkMap,
} from "@/services/api";
import { Badge, SessionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import PageShell, { PageHeader } from "@/components/ui/PageShell";

interface SessionType {
  session_id: string;
  status: string;
  workflow_title: string;
  expert_name?: string;
}

export default function ExpertPage() {
  const [session, setSession] = useState<SessionType | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const capture = useCaptureState();
  const status = capture.status;
  const canPauseResume = status === "capturing" || status === "paused" || status === "off_record";
  const canFinish = canPauseResume;

  useEffect(() => {
    if (!session) return;
    let active = true;
    const poll = async () => {
      try {
        const s = await getSession(session.session_id);
        if (!active) return;
        if (s.status) setStoreStatus(s.status);
        setEventStats(s.event_count ?? 0, s.latest_event?.timestamp_ms ?? null);
      } catch {
        // ignore transient polling errors
      }
    };
    void poll();
    const timer = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [session]);

  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    try {
      setError(null);
      setBusy(true);
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateSession = () =>
    run(async () => {
      const s = await createSession({
        workflow_title: "Invoice Processing",
        expert_name: "Demo Expert",
      });
      setSession(s);
      setStoreSession(s.session_id);
    });

  const handleStart = () =>
    run(async () => {
      if (!session) return;
      const r = await startCapture(session.session_id);
      setStoreStatus(r.status);
    });

  const handlePause = () =>
    run(async () => {
      if (!session) return;
      const r = await pauseSession(session.session_id);
      setStoreStatus(r.status);
    });

  const handleResume = () =>
    run(async () => {
      if (!session) return;
      const r = await resumeSession(session.session_id);
      setStoreStatus(r.status);
    });

  const handleOffRecord = () =>
    run(async () => {
      if (!session) return;
      const r = await offRecord(session.session_id);
      setStoreStatus(r.status);
    });

  const handleFinish = () =>
    run(async () => {
      if (!session) return;
      await finishSession(session.session_id);
      setStoreStatus("finished");
    });

  const handleGenerate = async () => {
    if (!session) return;
    const wm = await generateWorkMap(session.session_id);
    setWorkflowId(wm.id);
  };

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="AI Apprentice / Capture"
        title="Expert Capture"
        description="Share your screen and work as you normally would. Every action, field change and rationale becomes evidence in the Work Map."
        badges={
          <>
            <SessionBadge status={status} />
            <Badge tone="neutral">
              <Icon name="key" size={12} />
              {capture.sessionId ? `Session ${capture.sessionId.slice(0, 8)}` : "No session"}
            </Badge>
            <Badge tone="neutral">
              <Icon name="layers" size={12} />
              {session?.workflow_title ?? "Invoice Processing"}
            </Badge>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          <Card className="p-6 sm:p-7">
            <CardHeader
              icon="monitor"
              title="Expert workspace"
              subtitle="Nothing is recorded until you start the capture."
            />

            <ScreenSharePreview />
            <CaptureControls eventCount={capture.eventCount} lastEventAt={capture.lastEventAt} />

            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-line pt-5">
              {!session && (
                <Button variant="primary" icon="plus" busy={busy} onClick={handleCreateSession}>
                  Create session
                </Button>
              )}
              {session && status === "created" && (
                <Button variant="primary" icon="play" busy={busy} iconFilled onClick={handleStart}>
                  Start capture
                </Button>
              )}
              {status === "capturing" && (
                <Button variant="ghost" icon="pause" busy={busy} iconFilled onClick={handlePause}>
                  Pause capture
                </Button>
              )}
              {(status === "paused" || status === "off_record") && (
                <Button variant="primary" icon="play" busy={busy} iconFilled onClick={handleResume}>
                  Resume capture
                </Button>
              )}
              {status === "capturing" && (
                <Button variant="danger" icon="eyeOff" busy={busy} onClick={handleOffRecord}>
                  Off Record
                </Button>
              )}
              <Button
                variant="soft"
                icon="stop"
                busy={busy}
                disabled={!canFinish}
                onClick={handleFinish}
              >
                Finish task
              </Button>
            </div>

            {error && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
                <Icon name="alert" size={15} />
                {error}
              </p>
            )}

            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <Icon name="info" size={14} className="text-info" />
              Instrument your own system with the snippet below, then work while the interviewer
              listens.
            </p>
          </Card>

          {session && status !== "finished" && <InstrumentationCard sessionId={session.session_id} />}
        </div>

        <AgentPanel />
      </div>

      {status === "finished" && session && !workflowId && (
        <DebriefPanel key={session.session_id} sessionId={session.session_id} onGenerate={handleGenerate} />
      )}

      {workflowId && (
        <Card sheen className="mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ok-soft text-ok">
              <Icon name="checkCircle" size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold">Work Map generated</p>
              <p className="text-xs text-muted">Workflow {workflowId.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href={`/work-map/${workflowId}`} className="btn btn-primary btn-sm">
              <Icon name="map" size={13} />
              Review Work Map
            </Link>
            <Link href={`/apprentice?workflow=${workflowId}`} className="btn btn-soft btn-sm">
              <Icon name="graduation" size={13} />
              Train with this map
            </Link>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
