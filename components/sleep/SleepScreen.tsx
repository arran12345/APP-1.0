"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, SectionLabel } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Stat } from "@/components/ui/Stat";
import {
  selectLatestSleep,
  selectSleepAverages,
  selectSleepTrend,
  useStore,
} from "@/lib/store";
import type { SleepQuality } from "@/lib/types";
import { todayKey, toKey } from "@/lib/date";
import { addDays, format, parseISO } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Range = 7 | 30 | 90;

const QUALITY_LABELS: Record<SleepQuality, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
};

export function SleepScreen() {
  const sleep = useStore((s) => s.sleep);
  const logSleep = useStore((s) => s.logSleep);
  const removeSleep = useStore((s) => s.removeSleep);

  const [range, setRange] = useState<Range>(30);

  const trend = useMemo(() => selectSleepTrend(sleep, range), [sleep, range]);
  const avg = useMemo(() => selectSleepAverages(trend), [trend]);
  const latest = selectLatestSleep(sleep);
  const hasData = avg.nightsLogged > 0;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(toKey(addDays(new Date(), -1)));
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState<SleepQuality>(3);

  function submit() {
    logSleep({
      date,
      hours: Math.max(0, Math.min(24, Number(hours) || 0)),
      quality,
    });
    setOpen(false);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <Stat
            label="Avg hours"
            value={hasData ? avg.avgHours.toFixed(1) : "—"}
            unit={hasData ? "h / night" : undefined}
          />
          {hasData && (
            <p className="text-2xs text-ink-dim mt-2 tabular-nums">
              {avg.nightsLogged} night{avg.nightsLogged === 1 ? "" : "s"} logged
            </p>
          )}
        </Card>
        <Card className="p-4">
          <Stat
            label="Avg quality"
            value={hasData ? qualityLabel(avg.avgQuality) : "—"}
          />
          {hasData && (
            <p className="text-2xs text-ink-dim mt-2 tabular-nums">
              {avg.avgQuality.toFixed(1)} / 4
            </p>
          )}
        </Card>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => {
          // "Last night" is the typical log-on-waking case
          setDate(toKey(addDays(new Date(), -1)));
          setHours(latest?.hours ?? 7.5);
          setQuality(latest?.quality ?? 3);
          setOpen(true);
        }}
      >
        <Plus size={16} strokeWidth={2.5} /> Log sleep
      </Button>

      <Card>
        <CardHeader
          title="Hours per night"
          subtitle={hasData ? `Target 8h` : "No data yet"}
          trailing={
            <div className="inline-flex bg-bg-elev border border-line rounded-md p-0.5">
              {([7, 30, 90] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={[
                    "px-2.5 h-7 rounded text-2xs font-medium tracking-wide transition-colors",
                    range === r
                      ? "bg-bg-hover text-ink"
                      : "text-ink-muted hover:text-ink",
                  ].join(" ")}
                >
                  {r}d
                </button>
              ))}
            </div>
          }
        />
        <CardBody>
          {hasData ? (
            <SleepBars data={trend} />
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-ink-dim">
              Log a night to see the chart.
            </div>
          )}
        </CardBody>
      </Card>

      <SectionLabel>Recent</SectionLabel>
      {sleep.length === 0 ? (
        <Empty
          title="No sleep logged yet"
          hint="Tap Log sleep to record how long and how well you slept."
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {[...sleep]
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 14)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">
                    {format(parseISO(s.date), "EEE, MMM d")}
                  </p>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {s.hours}h · {QUALITY_LABELS[s.quality]}
                  </p>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Remove sleep entry"
                  onClick={() => removeSleep(s.id)}
                >
                  <Trash2 size={14} className="text-ink-dim" />
                </IconButton>
              </div>
            ))}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Log sleep">
        <div className="space-y-3">
          <Input
            label="Date (the morning you woke up)"
            type="date"
            max={todayKey()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Hours slept"
            type="number"
            inputMode="decimal"
            min={0}
            max={24}
            step={0.25}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            trailing="h"
          />
          <div>
            <span className="block text-2xs uppercase tracking-widest text-ink-dim mb-1.5">
              Quality
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {([1, 2, 3, 4] as SleepQuality[]).map((q) => {
                const active = q === quality;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={[
                      "h-10 rounded-md text-xs font-medium transition-colors border",
                      active
                        ? "bg-accent text-accent-ink border-accent"
                        : "bg-bg-elev text-ink-muted border-line hover:text-ink hover:bg-bg-hover",
                    ].join(" ")}
                  >
                    {QUALITY_LABELS[q]}
                  </button>
                );
              })}
            </div>
          </div>
          <Button variant="primary" className="w-full mt-1" onClick={submit}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

function qualityLabel(score: number): string {
  if (score >= 3.5) return "Great";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Fair";
  return "Poor";
}

interface BarPoint {
  date: string;
  hours: number;
  quality: number;
}

function SleepBars({ data }: { data: BarPoint[] }) {
  const firstNonZero = data.findIndex((p) => p.hours > 0);
  const trimmed =
    firstNonZero > 0 ? data.slice(Math.max(0, firstNonZero - 1)) : data;
  const max = Math.max(10, ...trimmed.map((p) => p.hours));

  return (
    <div className="h-40 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trimmed} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#E5DCC4" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(parseISO(d), "d")}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A4B7", fontSize: 10 }}
            minTickGap={12}
          />
          <YAxis
            domain={[0, Math.ceil(max)]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A4B7", fontSize: 10 }}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(91,155,213,0.08)" }}
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #E5DCC4",
              borderRadius: 8,
              fontSize: 12,
              color: "#1E293B",
              padding: "6px 10px",
              boxShadow: "0 1px 2px 0 rgba(30,41,59,0.06)",
            }}
            labelFormatter={(d) => format(parseISO(d as string), "EEE, MMM d")}
            formatter={(value: number, _name, item) => {
              const q = item?.payload?.quality as number;
              const label = q ? ` · ${qualityLabel(q)}` : "";
              return [`${value}h${label}`, "Sleep"];
            }}
          />
          <ReferenceLine y={8} stroke="#5D7185" strokeDasharray="4 4" strokeWidth={1} />
          <Bar
            dataKey="hours"
            fill="#5B9BD5"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
