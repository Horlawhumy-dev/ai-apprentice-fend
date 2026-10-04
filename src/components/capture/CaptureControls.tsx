"use client";

import { Stat } from "@/components/ui/Card";
import { useCaptureState } from "@/hooks/useCaptureState";
import { sessionLabel, sessionTone } from "@/lib/ui";

export default function CaptureControls({
  eventCount,
  lastEventAt,
}: {
  eventCount: number;
  lastEventAt: number | null;
}) {
  const { status } = useCaptureState();
  const tone = sessionTone[status] ?? "neutral";

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Status" value={sessionLabel[status] ?? status} icon="radio" tone={tone} />
      <Stat label="Events" value={eventCount} icon="activity" tone={eventCount > 0 ? "brand" : "neutral"} />
      <Stat
        label="Latest event"
        value={lastEventAt ? new Date(lastEventAt).toLocaleTimeString() : "—"}
        icon="clock"
      />
    </div>
  );
}
