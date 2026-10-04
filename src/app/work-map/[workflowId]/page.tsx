import type { Metadata } from "next";
import WorkMapView from "@/components/work-map/WorkMapView";
import PageShell, { PageHeader } from "@/components/ui/PageShell";

export const metadata: Metadata = {
  title: "Work Map",
  description: "Review workflow steps, confirm rules, and inspect the evidence behind each decision.",
};

export default async function WorkMapPage({ params }: PageProps<"/work-map/[workflowId]">) {
  const { workflowId } = await params;

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
