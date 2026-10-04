"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addEvent } from "@/services/api";
import { getCaptureState, isCapturing, recordEvent } from "@/services/captureStore";
import { useCaptureState } from "@/hooks/useCaptureState";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, Stat } from "@/components/ui/Card";
import { Field, FieldRow, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import PageShell, { PageHeader } from "@/components/ui/PageShell";
import { sessionLabel, sessionLive, sessionTone } from "@/lib/ui";

interface Invoice {
  id: string;
  supplier: string;
  amount: number;
  costCenter: string;
  assetNumber: string;
}

const INITIAL: Invoice = {
  id: "INV-4471",
  supplier: "Northwind Industrial",
  amount: 7200,
  costCenter: "OPEX",
  assetNumber: "",
};

export default function DemoErpPage() {
  const [invoice, setInvoice] = useState<Invoice>(INITIAL);
  const [history, setHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastEvent, setLastEvent] = useState<string>("—");
  const capture = useCaptureState();
  const live = sessionLive(capture.status);

  const emit = async (type: string, data: Record<string, unknown>) => {
    const st = getCaptureState();
    const timestamp = Date.now();
    if (st.sessionId && isCapturing()) {
      try {
        await addEvent(st.sessionId, {
          client_event_id: crypto.randomUUID(),
          timestamp_ms: timestamp,
          source: "demo_erp",
          type,
          data,
        });
      } catch {
        // ignore demo network errors
      }
      recordEvent(timestamp);
    }
    setLastEvent(`${type} @ ${new Date(timestamp).toLocaleTimeString()}`);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void emit("invoice_opened", {
        invoice_id: INITIAL.id,
        amount: INITIAL.amount,
        supplier: INITIAL.supplier,
      });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const viewHistory = () => {
    setHistory(true);
    void emit("supplier_history_viewed", { supplier: invoice.supplier, invoice_id: invoice.id });
  };

  const changeCostCenter = (value: string) => {
    const old = invoice.costCenter;
    setInvoice((i) => ({ ...i, costCenter: value }));
    void emit("field_changed", {
      entity: "invoice",
      field: "cost_center",
      old_value: old,
      new_value: value,
      invoice_id: invoice.id,
    });
  };

  const enterAssetNumber = (value: string) => {
    setInvoice((i) => ({ ...i, assetNumber: value }));
    if (value) {
      void emit("asset_number_entered", {
        field: "asset_number",
        new_value: value,
        invoice_id: invoice.id,
      });
    }
  };

  const save = () => {
    void emit("save_attempted", {
      invoice_id: invoice.id,
      cost_center: invoice.costCenter,
      asset_number: invoice.assetNumber,
      amount: invoice.amount,
    });
    setSaved(true);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Fictional Demo ERP"
        title="Invoice Processing"
        description="A throwaway app that emits real capture events. Share this tab from the capture screen to watch the Work Map fill itself in."
        badges={
          <>
            <Badge tone={sessionTone[capture.status] ?? "neutral"} pulse={live}>
              <StatusDot tone={sessionTone[capture.status] ?? "neutral"} pulse={live} />
              {sessionLabel[capture.status] ?? capture.status}
            </Badge>
            <Link
              href="/expert"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-inset px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-brand-strong"
            >
              <Icon name="arrowLeft" size={12} />
              Back to capture
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        {/* The "app window" being captured */}
        <Card sheen className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2/50 px-4 py-3">
            <span className="size-2.5 rounded-full bg-bad/70" />
            <span className="size-2.5 rounded-full bg-warn/70" />
            <span className="size-2.5 rounded-full bg-ok/70" />
            <span className="ml-2 truncate font-mono text-xs text-faint">erp.northwind.internal/invoices/{invoice.id}</span>
          </div>

          <div className="p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Invoice {invoice.id}</h2>
              {invoice.amount >= 5000 && (
                <Badge tone="warn">
                  <Icon name="alert" size={12} />
                  Above capitalization threshold
                </Badge>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Stat label="Supplier" value={invoice.supplier} icon="building" />
              <Stat label="Amount" value={`$${invoice.amount.toLocaleString()}`} icon="trending" tone="brand" />
            </div>

            <div className="mt-6 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
              <FieldRow label="Cost center" htmlFor="erp-cost-center">
                <Select
                  id="erp-cost-center"
                  value={invoice.costCenter}
                  onChange={(e) => changeCostCenter(e.target.value)}
                >
                  <option value="OPEX">OPEX</option>
                  <option value="CAPEX">CAPEX</option>
                </Select>
              </FieldRow>

              <FieldRow label="Asset number" htmlFor="erp-asset-number">
                <Field
                  id="erp-asset-number"
                  value={invoice.assetNumber}
                  onChange={(e) => enterAssetNumber(e.target.value)}
                  placeholder="A-1001"
                  className="font-mono"
                />
              </FieldRow>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-line pt-5">
              <Button variant="ghost" icon="search" onClick={viewHistory}>
                View supplier history
              </Button>
              <Button variant="primary" icon="check" onClick={save}>
                Save invoice
              </Button>
            </div>

            {saved && (
              <p className="animate-rise mt-4 inline-flex items-center gap-2 rounded-lg bg-ok-soft px-3 py-2 text-sm text-ok">
                <Icon name="checkCircle" size={15} />
                Saved to local demo state.
              </p>
            )}
          </div>
        </Card>

        {/* Capture telemetry */}
        <Card className="h-fit p-6">
          <CardHeader
            icon="activity"
            title="Activity"
            subtitle="Events fire only while capture is active."
          />

          <div className="mt-5 space-y-3">
            <div className="glass-inset rounded-xl px-3.5 py-3">
              <p className="eyebrow">Last event</p>
              <p className="mt-1.5 font-mono text-xs break-all">{lastEvent}</p>
            </div>

            <div
              className={`rounded-xl px-3.5 py-3 transition-colors ${
                live ? "bg-ok-soft" : "glass-inset"
              }`}
            >
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <StatusDot tone={live ? "ok" : "neutral"} pulse={live} />
                {live ? "Streaming events" : "Events paused"}
              </p>
              <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                This page is safe to share as your screen — nothing is stored server-side.
              </p>
            </div>

            {history && (
              <div className="animate-rise glass-inset rounded-xl p-3.5">
                <p className="eyebrow flex items-center gap-1.5">
                  <Icon name="building" size={11} />
                  Supplier history
                </p>
                <p className="mt-2 text-sm">Previous invoices: 3</p>
                <p className="mt-0.5 text-sm text-muted">Last invoice: $2,100 (OPEX)</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
