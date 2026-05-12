"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { downloadReport, type ReportRange } from "@/lib/export";
import { useStore } from "@/lib/store";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

const OPTIONS: { days: ReportRange; label: string }[] = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

export function ExportCard() {
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);
  const metrics = useStore((s) => s.metrics);
  const food = useStore((s) => s.food);
  const sleep = useStore((s) => s.sleep);

  const [busy, setBusy] = useState<ReportRange | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(days: ReportRange) {
    setBusy(days);
    setError(null);
    try {
      await downloadReport(days, {
        settings,
        workouts,
        metrics,
        food,
        sleep,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't generate the report.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Export PDF report"
        subtitle="For your records — and for pasting into AI for analysis"
      />
      <CardBody className="space-y-2">
        {OPTIONS.map(({ days, label }) => {
          const loading = busy === days;
          return (
            <button
              key={days}
              type="button"
              disabled={busy !== null}
              onClick={() => download(days)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border border-line bg-bg-elev hover:bg-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm text-ink">{label}</span>
              {loading ? (
                <Loader2
                  size={14}
                  className="text-ink-muted animate-spin shrink-0"
                />
              ) : (
                <Download size={14} className="text-ink-muted shrink-0" />
              )}
            </button>
          );
        })}
        {error && (
          <p className="text-2xs text-danger mt-1" role="alert">
            {error}
          </p>
        )}
        <p className="text-2xs text-ink-dim pt-1">
          Contains training, nutrition, sleep, and body metrics in the chosen
          window. No images — text only so it's easy for AI to read.
        </p>
      </CardBody>
    </Card>
  );
}
