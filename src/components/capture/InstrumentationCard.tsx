"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const noopSubscribe = () => () => {};

export default function InstrumentationCard({ sessionId }: { sessionId: string }) {
  const [copied, setCopied] = useState(false);
  // Browser-only value: empty on the server, the real origin after hydration.
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");

  const snippet = `<!-- AI Apprentice instrumentation -->
<script src="${origin}/sdk/ai-apprentice-capture.js"
        data-api-url="${API_URL}"
        data-session-id="${sessionId}"
        data-source="my_real_app"
        data-auto-track="true"></script>`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="mt-6 p-6 sm:p-7">
      <CardHeader
        icon="terminal"
        title="Capture your own system"
        subtitle="Add this snippet to the app you want to capture. It streams clicks, field changes and submits while this session is capturing, and stops automatically on Pause or Off Record."
      />

      <div className="relative mt-5 overflow-hidden rounded-xl border border-line-strong bg-surface-inset">
        <pre className="scroll-thin overflow-x-auto p-4 font-mono text-xs leading-relaxed">
          <code suppressHydrationWarning>{snippet}</code>
        </pre>
        {copied && (
          <span className="animate-rise absolute inset-0 grid place-items-center bg-canvas/80 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-ok px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              <Icon name="check" size={13} strokeWidth={3} />
              Copied to clipboard
            </span>
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant={copied ? "ok" : "primary"} icon={copied ? "check" : "copy"} onClick={() => void copy()}>
          {copied ? "Copied" : "Copy snippet"}
        </Button>
        <span className="text-xs text-muted">
          or call{" "}
          <code className="rounded-md bg-surface-inset px-1.5 py-0.5 font-mono">
            AIApprentice.init( &#123; sessionId, apiUrl &#125; )
          </code>
        </span>
      </div>

      <ul className="mt-5 grid gap-2.5 border-t border-line pt-5 sm:grid-cols-3">
        {[
          {
            icon: "target" as const,
            title: "Mark controls",
            body: "data-ai-apprentice=\"type\"",
          },
          {
            icon: "eyeOff" as const,
            title: "Exclude fields",
            body: "data-ai-apprentice-ignore",
          },
          {
            icon: "lightbulb" as const,
            title: "Log reasoning",
            body: "AIApprentice.decision(\"why…\")",
          },
        ].map((t) => (
          <li key={t.title} className="glass-inset rounded-xl px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <Icon name={t.icon} size={13} className="text-brand" />
              {t.title}
            </p>
            <p className="mt-1 truncate font-mono text-[0.68rem] text-muted">{t.body}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
