import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import PageShell from "@/components/ui/PageShell";

export const metadata: Metadata = {
  // No `title` here: this page shares the root segment with the layout, so
  // `title.template` does not apply and it inherits the branded default.
  description:
    "Turn expert judgement into a curriculum for everyone. Capture a real work session, distil it into a reviewable Work Map, and coach new hires against confirmed rules.",
};

const stages: { icon: IconName; label: string; caption: string }[] = [
  { icon: "monitor", label: "Capture", caption: "Expert works normally" },
  { icon: "map", label: "Map", caption: "Steps, rules, evidence" },
  { icon: "graduation", label: "Train", caption: "Apprentice practises" },
];

const destinations: {
  href: string;
  icon: IconName;
  title: string;
  copy: string;
  points: string[];
}[] = [
  {
    href: "/expert",
    icon: "monitor",
    title: "Expert Capture",
    copy: "Share a screen, work as usual, and narrate the judgement calls the UI can't infer.",
    points: ["Live event stream", "Pause and Off Record", "Voice-style rationale log"],
  },
  {
    href: "/work-map/demo",
    icon: "map",
    title: "Work Map",
    copy: "A reviewable timeline of every step, its reasoning, and the guardrails behind it.",
    points: ["Evidence per step", "Confidence scoring", "Expert confirmation"],
  },
  {
    href: "/apprentice",
    icon: "graduation",
    title: "Apprentice",
    copy: "Practise on fresh cases and get coached only by rules the expert actually confirmed.",
    points: ["Scenario practice", "Rule-based blocking", "Coaching questions"],
  },
];

export default function Home() {
  return (
    <PageShell wide>
      {/* Hero */}
      <section className="relative animate-rise text-center">
        <Badge tone="brand" className="px-3 py-1.5 text-xs">
          <Icon name="sparkles" size={13} />
          Prototype · Capture → Map → Teach
        </Badge>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
          <span className="gradient-text">Turn expert judgement</span>
          <br />
          into a curriculum for everyone.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted text-pretty sm:text-lg">
          AI Apprentice watches a real work session, distils the reasoning behind it, and coaches new
          hires against the rules your best people actually follow.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/expert" className="btn btn-primary btn-lg group">
            Start a capture
            <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/work-map/demo" className="btn btn-ghost btn-lg">
            <Icon name="map" size={16} />
            View a Work Map
          </Link>
        </div>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
          {stages.map((s, i) => (
            <div key={s.label} className="glass sheen-edge group relative rounded-2xl px-3 py-5 sm:px-5">
              <div className="flex items-center justify-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-brand-soft text-brand-strong transition-transform duration-300 group-hover:scale-110 sm:size-9">
                  <Icon name={s.icon} size={16} />
                </span>
                <p className="text-sm font-semibold tracking-tight sm:text-base">{s.label}</p>
              </div>
              <p className="mt-1.5 hidden text-xs text-muted sm:block">{s.caption}</p>
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-line-strong bg-surface-3 px-1.5 text-[0.6rem] font-semibold text-faint">
                0{i + 1}
              </span>
            </div>
          ))}
        </dl>
      </section>

      <div className="hairline my-16 sm:my-20" />

      {/* Destinations */}
      <section>
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow flex items-center gap-1.5">
            <span className="inline-block h-px w-6 bg-line-strong" />
            The loop
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl">
            Three surfaces, one continuous loop.
          </h2>
          <p className="mt-2 text-[0.95rem] text-muted text-pretty">
            Every capture produces a map; every confirmed map trains the next person.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {destinations.map((d, i) => (
            <Link key={d.href} href={d.href} className="group block">
              <Card
                interactive
                sheen
                className="relative flex h-full flex-col overflow-hidden p-6"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand/12 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-strong ring-1 ring-line">
                    <Icon name={d.icon} size={19} />
                  </span>
                  <span className="text-xs font-semibold text-faint tabular-nums">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{d.copy}</p>

                <ul className="mt-5 space-y-1.5">
                  {d.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-muted">
                      <Icon name="check" size={13} className="text-ok" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-1.5 border-t border-line pt-4 text-sm font-medium text-brand-strong">
                  Open
                  <Icon
                    name="arrowRight"
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Callout */}
      <section className="mt-16 sm:mt-20">
        <Card className="relative overflow-hidden p-7 sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/12 via-transparent to-info/12"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <CardHeader
                icon="terminal"
                title="Instrument any app in one snippet"
                subtitle="No rebuild required. The capture SDK streams clicks, field changes and submits straight into the session."
              />
            </div>
            <Link
              href="/expert"
              className="btn btn-primary shrink-0"
            >
              See the snippet
              <Icon name="chevronRight" size={15} />
            </Link>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
