import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WorkMapView from "@/components/work-map/WorkMapView";
import PageShell, { PageHeader } from "@/components/ui/PageShell";
import { Card, EmptyState } from "@/components/ui/Card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Work Map",
  description: "Review workflow steps, confirm rules, and inspect the evidence behind each decision.",
};

async function resolveLatest(): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/workflows/latest`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}

export default async function WorkMapPage({ params }: PageProps<"/work-map/[workflowId]">) {
  const { workflowId } = await params;

  // "latest" always points at a work map the user actually captured; nothing is seeded.
  if (workflowId === "latest") {
    const id = await resolveLatest();
    if (!id) {
      return (
        <PageShell wide>
          <PageHeader
            eyebrow="AI Apprentice / Review"
            title="Work Map"
            description="Review workflow steps, confirm the rules behind them, and inspect the evidence each decision was derived from."
          />
          <Card className="p-6 sm:p-7">
            <EmptyState
              icon="map"
              title="No work map yet"
              hint="Run a capture first. Every step, rule, and quote on this page comes from what you actually did and said."
            />
            <div className="mt-5 flex justify-center">
              <Link href="/expert" className="btn btn-primary">
                Start a capture
              </Link>
            </div>
          </Card>
        </PageShell>
      );
    }
    redirect(`/work-map/${id}`);
  }

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="AI Apprentice / Review"
        title="Work Map"
        description="Review workflow steps, confirm the rules behind them, and inspect the evidence each decision was derived from."
        badges={
          <code className="glass-inset rounded-lg px-2 py-1 font-mono text-[0.7rem] text-muted">
            {workflowId}
          </code>
        }
      />
      <WorkMapView workflowId={workflowId} />
    </PageShell>
  );
}