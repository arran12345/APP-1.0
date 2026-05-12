"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, SectionLabel } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Stat } from "@/components/ui/Stat";
import {
  selectLatestMetric,
  selectMetricSeries,
  useStore,
} from "@/lib/store";
import { todayKey } from "@/lib/date";
import { HeartPulse, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { MetricChart } from "./MetricChart";
import { TrainingSection } from "./TrainingSection";
import { NutritionSection } from "./NutritionSection";
import type { BodyMetric } from "@/lib/types";
import { format, parseISO } from "date-fns";

type Range = 30 | 60 | 180;

export function ProgressScreen() {
  const metrics = useStore((s) => s.metrics);
  const logMetric = useStore((s) => s.logMetric);
  const removeMetric = useStore((s) => s.removeMetric);
  const settings = useStore((s) => s.settings);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [weight, setWeight] = useState("");
  const [bf, setBf] = useState("");
  const [range, setRange] = useState<Range>(30);

  const series = useMemo(
    () => selectMetricSeries(metrics, range),
    [metrics, range],
  );
  const latest = selectLatestMetric(metrics);

  // Weight delta = latest vs earliest in selected range (only counting points
  // that actually have a weight value).
  const weightTrend = useMemo(() => {
    const weights = series.filter((m) => m.weight != null);
    if (weights.length < 2) return null;
    const first = weights[0].weight!;
    const last = weights[weights.length - 1].weight!;
    return { delta: +(last - first).toFixed(1), first, last };
  }, [series]);

  function submit() {
    const w = weight ? Number(weight) : undefined;
    const f = bf ? Number(bf) : undefined;
    if (w === undefined && f === undefined) return;
    logMetric({
      date,
      weight: w !== undefined && !Number.isNaN(w) ? w : undefined,
      bodyFat: f !== undefined && !Number.isNaN(f) ? f : undefined,
    });
    setWeight("");
    setBf("");
    setOpen(false);
  }

  return (
    <>
      {/* Shared range toggle. Sits above all three sections so the whole page
          reflects the same time window. */}
      <div className="flex items-center justify-between px-1">
        <span className="text-2xs uppercase tracking-widest text-ink-dim">
          Range
        </span>
        <div className="inline-flex bg-bg-elev border border-line rounded-md p-0.5">
          {([30, 60, 180] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={[
                "px-3 h-7 rounded text-2xs font-medium tracking-wide transition-colors",
                range === r
                  ? "bg-bg-hover text-ink"
                  : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* ----- Body section ----- */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <HeartPulse size={13} className="text-accent" />
          <h2 className="text-2xs uppercase tracking-widest text-ink-muted">
            Body
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <Stat
              label="Weight"
              value={latest?.weight ? latest.weight.toFixed(1) : "—"}
              unit={latest?.weight ? settings.unit : undefined}
              trend={
                weightTrend
                  ? { delta: weightTrend.delta, suffix: ` ${settings.unit}` }
                  : undefined
              }
            />
          </Card>
          <Card className="p-4">
            <Stat
              label="Body fat"
              value={latest?.bodyFat ? latest.bodyFat.toFixed(1) : "—"}
              unit={latest?.bodyFat ? "%" : undefined}
            />
            <p className="text-2xs text-ink-dim mt-2">
              {latest
                ? `Logged ${format(parseISO(latest.date), "MMM d")}`
                : "No data"}
            </p>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Weight trend"
            subtitle={
              series.length > 0
                ? `${series.length} entr${series.length === 1 ? "y" : "ies"}`
                : "No data yet"
            }
          />
          <CardBody>
            {series.length < 2 ? (
              <div className="h-44 flex items-center justify-center text-xs text-ink-dim">
                {series.length === 0
                  ? "Log two entries to see a chart."
                  : "One more entry needed."}
              </div>
            ) : (
              <MetricChart data={series} unit={settings.unit} />
            )}
          </CardBody>
        </Card>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            setDate(todayKey());
            setOpen(true);
          }}
        >
          <Plus size={16} strokeWidth={2.5} /> Log measurement
        </Button>
      </section>

      {/* ----- Training section ----- */}
      <TrainingSection rangeDays={range} unit={settings.unit} />

      {/* ----- Nutrition section ----- */}
      <NutritionSection rangeDays={range} />

      {/* ----- Body metric history ----- */}
      <section>
        <SectionLabel>History</SectionLabel>
        {metrics.length === 0 ? (
          <Empty
            title="No measurements yet"
            hint="Log your bodyweight and body fat % to see trends."
          />
        ) : (
          <Card className="divide-y divide-line overflow-hidden">
            {metrics.slice(0, 12).map((m) => (
              <MetricRow
                key={m.id}
                m={m}
                unit={settings.unit}
                onRemove={() => removeMetric(m.id)}
              />
            ))}
          </Card>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Log measurement">
        <div className="space-y-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              autoFocus
              label="Weight"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              trailing={settings.unit}
            />
            <Input
              label="Body fat"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={bf}
              onChange={(e) => setBf(e.target.value)}
              trailing="%"
            />
          </div>
          <Button variant="primary" className="w-full mt-1" onClick={submit}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

function MetricRow({
  m,
  unit,
  onRemove,
}: {
  m: BodyMetric;
  unit: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink">
          {format(parseISO(m.date), "EEE, MMM d")}
        </p>
        <p className="text-xs text-ink-muted tabular-nums">
          {m.weight != null && (
            <>
              {m.weight}
              {unit}
            </>
          )}
          {m.weight != null && m.bodyFat != null && " · "}
          {m.bodyFat != null && <>{m.bodyFat}% BF</>}
        </p>
      </div>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Remove entry"
        onClick={onRemove}
      >
        <Trash2 size={14} className="text-ink-dim" />
      </IconButton>
    </div>
  );
}
