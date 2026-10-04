"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCaptureState } from "@/hooks/useCaptureState";
import { getCaptureState } from "@/services/captureStore";
import { addTranscript, getVoiceConfig, requestVoiceToken } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { sessionLabel, sessionLive, sessionTone, type Tone } from "@/lib/ui";

type Speaker = "expert" | "agent";

interface Line {
  speaker: Speaker;
  text: string;
  timestamp_ms: number;
}

type ConnState = "idle" | "connecting" | "live" | "error";

interface VoiceHandle {
  endSession: () => Promise<void>;
}

const idleHint: Record<string, string> = {
  created: "Session ready. Start the capture, then narrate as you work.",
  capturing: "Listening. Add rationale while you work — it becomes Work Map evidence.",
  paused: "Paused. Rationale you add now is not recorded.",
  off_record: "Off record. Nothing is being captured.",
  finished: "Capture finished. Answer the debrief to build the Work Map.",
};

export default function AgentPanel() {
  const capture = useCaptureState();
  const [lines, setLines] = useState<Line[]>([]);
  const [text, setText] = useState("");
  const [conn, setConn] = useState<ConnState>("idle");
  const [connError, setConnError] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<"checking" | "ready" | "unconfigured" | "unreachable">(
    "checking",
  );
  const voiceOn = voiceState === "ready";
  const logRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef<VoiceHandle | null>(null);
  const lastUserLine = useRef<string>("");

  const status = capture.status;
  const tone: Tone = sessionTone[status] ?? "neutral";
  const recording = sessionLive(status);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  // A backend restart (or `--reload`) makes this fetch fail transiently. Retrying keeps
// the control on screen instead of silently swapping the user to manual mode.
useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const poll = () => {
      getVoiceConfig()
        .then((cfg) => {
          if (!active) return;
          setVoiceState(cfg.configured && cfg.mode === "signed_url" ? "ready" : "unconfigured");
        })
        .catch(() => {
          if (!active) return;
          attempt += 1;
          if (attempt <= 5) {
            setVoiceState("checking");
            timer = setTimeout(poll, 1500);
          } else {
            setVoiceState("unreachable");
          }
        });
    };

    poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const push = useCallback((speaker: Speaker, body: string) => {
    const clean = body.trim();
    if (!clean) return;
    setLines((prev) => [
      ...prev,
      { speaker, text: clean, timestamp_ms: Date.now() },
    ]);
  }, []);

  const persistExpert = useCallback(
    async (body: string) => {
      const st = getCaptureState();
      if (!st.sessionId || !sessionLive(st.status)) return;
      try {
        await addTranscript(st.sessionId, {
          segment_id: crypto.randomUUID(),
          timestamp_ms: Date.now(),
          speaker: "expert",
          text: body.trim(),
          source: "voice_provider",
        });
      } catch {
        // a dropped segment must not break the live conversation
      }
    },
    []
  );

  const stopVoice = useCallback(async () => {
    const handle = sessionRef.current;
    sessionRef.current = null;
    setConn("idle");
    if (handle) {
      try {
        await handle.endSession();
      } catch {
        // already closed
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      const handle = sessionRef.current;
      sessionRef.current = null;
      void handle?.endSession().catch(() => undefined);
    };
  }, []);

  const startVoice = async () => {
    if (conn === "connecting" || conn === "live") return;
    setConnError(null);
    setConn("connecting");
    try {
      const { signed_url } = await requestVoiceToken();
      const { Conversation } = await import("@elevenlabs/client");
      const conversation = await Conversation.startSession({
        signedUrl: signed_url,
        onConnect: () => setConn("live"),
        onStatusChange: ({ status: next }) => {
          if (next === "connected") setConn("live");
          if (next === "disconnected" || next === "disconnecting") setConn("idle");
        },
        onMessage: ({ message, role }) => {
          if (role === "user") {
            if (message === lastUserLine.current) return;
            lastUserLine.current = message;
            push("expert", message);
            void persistExpert(message);
          } else {
            push("agent", message);
          }
        },
        onError: (message) => {
          setConn("error");
          setConnError(typeof message === "string" ? message : "Voice session failed");
        },
        onDisconnect: () => setConn("idle"),
      });
      sessionRef.current = conversation as unknown as VoiceHandle;
      setConn("live");
    } catch (e) {
      setConn("error");
      setConnError(e instanceof Error ? e.message : "Could not start the voice session");
    }
  };

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    push("expert", body);
    setText("");
    await persistExpert(body);
  };

  const connTone: Tone =
    conn === "live" ? "ok" : conn === "connecting" ? "warn" : conn === "error" ? "bad" : "neutral";

  const voiceHint: Record<Exclude<typeof voiceState, "ready">, string> = {
    checking: "Checking voice service…",
    unconfigured: "Voice is not configured on the API — type below instead.",
    unreachable: "Can't reach the API to start voice. Retry, or type below.",
  };

  return (
    <Card className="flex h-full flex-col p-6">
      <CardHeader
        icon="mic"
        title="Apprentice interviewer"
        subtitle={voiceOn ? "ElevenLabs voice agent" : "Manual transcript mode"}
        action={
          <Badge tone={tone} pulse={recording}>
            <StatusDot tone={tone} pulse={recording} />
            {sessionLabel[status] ?? "Idle"}
          </Badge>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-surface-inset px-3 py-2.5">
        <Badge tone={connTone} pulse={conn === "live"}>
          <StatusDot tone={connTone} pulse={conn === "live"} />
          {conn === "live" ? "Voice live" : conn === "connecting" ? "Connecting" : conn === "error" ? "Voice error" : "Voice off"}
        </Badge>

        {voiceOn ? (
          conn === "live" || conn === "connecting" ? (
            <Button size="sm" variant="danger" icon="stop" busy={conn === "connecting"} onClick={() => void stopVoice()}>
              Stop voice
            </Button>
          ) : (
            <Button size="sm" variant="primary" icon="mic" onClick={() => void startVoice()}>
              Start voice interview
            </Button>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            {voiceState === "checking" && <StatusDot tone="warn" pulse />}
            {voiceHint[voiceState]}
          </span>
        )}

        {conn === "live" && (
          <span className="text-xs text-muted">
            {recording ? "Rationale is being saved as evidence." : "Paused — start the capture to record it."}
          </span>
        )}
      </div>

      {connError && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
          <Icon name="alert" size={15} />
          {connError}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-inset px-3 py-2.5 text-xs text-muted">
        <Icon name={recording ? "radio" : "circle"} size={14} className={recording ? "text-ok" : "text-faint"} />
        {idleHint[status] ?? "Waiting for a session."}
      </div>

      <div
        ref={logRef}
        className="scroll-thin mt-4 max-h-72 min-h-40 flex-1 space-y-2 overflow-y-auto pr-1 text-sm"
      >
        {lines.length === 0 ? (
          <EmptyState
            icon="message"
            title="No transcript yet"
            hint="Every line you add is timestamped and linked to the moment it describes."
          />
        ) : (
          lines.map((l, i) => (
            <div
              key={i}
              className={`animate-rise rounded-xl border px-3 py-2.5 ${
                l.speaker === "agent"
                  ? "rounded-tl-sm border-brand/25 bg-brand-soft/40"
                  : "rounded-tl-sm border-line bg-surface-2"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold capitalize">
                  <Icon
                    name={l.speaker === "agent" ? "sparkles" : "user"}
                    size={12}
                    className={l.speaker === "agent" ? "text-brand" : "text-muted"}
                  />
                  {l.speaker === "agent" ? "Interviewer" : l.speaker}
                </span>
                <span className="text-[0.65rem] text-faint tabular-nums">
                  {new Date(l.timestamp_ms).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 leading-relaxed">{l.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void send()}
          placeholder="Add what you decided, and why"
          aria-label="Add a rationale"
          className="field"
        />
        <Button variant="primary" icon="send" onClick={() => void send()} aria-label="Send rationale" />
      </div>
    </Card>
  );
}
