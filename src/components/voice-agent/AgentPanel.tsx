"use client";

import { useEffect, useRef, useState } from "react";
import { useCaptureState } from "@/hooks/useCaptureState";
import { addTranscript } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { sessionLabel, sessionLive, sessionTone, type Tone } from "@/lib/ui";

interface Line {
  speaker: string;
  text: string;
  timestamp_ms: number;
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
  const logRef = useRef<HTMLDivElement | null>(null);

  const status = capture.status;
  const tone: Tone = sessionTone[status] ?? "neutral";
  const recording = sessionLive(status);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    const line: Line = { speaker: "expert", text: body, timestamp_ms: Date.now() };
    setLines((l) => [...l, line]);
    setText("");
    if (capture.sessionId && recording) {
      try {
        await addTranscript(capture.sessionId, {
          segment_id: crypto.randomUUID(),
          timestamp_ms: line.timestamp_ms,
          speaker: "expert",
          text: body,
          source: "prototype_transcript",
        });
      } catch {
        // ignore demo errors
      }
    }
  };

  return (
    <Card className="flex h-full flex-col p-6">
      <CardHeader
        icon="mic"
        title="Apprentice interviewer"
        subtitle="Prototype transcript mode"
        action={
          <Badge tone={tone} pulse={recording}>
            <StatusDot tone={tone} pulse={recording} />
            {sessionLabel[status] ?? "Idle"}
          </Badge>
        }
      />

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
              className="animate-rise rounded-xl rounded-tl-sm border border-line bg-surface-2 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold capitalize">
                  <Icon name="user" size={12} className="text-brand" />
                  {l.speaker}
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
          placeholder="e.g. This compressor exceeds our capitalization threshold"
          aria-label="Add a rationale"
          className="field"
        />
        <Button variant="primary" icon="send" onClick={() => void send()} aria-label="Send rationale" />
      </div>
    </Card>
  );
}
