"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Stat } from "@/components/ui/Stat";
import {
  selectExerciseNames,
  selectExerciseTrend,
  selectTrainingSummary,
  useStore,
} from "@/lib/store";
import type { Unit } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  rangeDays: number;
  unit: Unit;
}

export function TrainingSection({ rangeDays, unit }: Props) {
  const workouts = useStore((s) => s.workouts);

  const names = useMemo(() => selectExerciseNames(workouts), [workouts]);
  const summary = useMemo(
    () => selectTrainingSummary(workouts, rangeDays),
    [workouts, rangeDays],
  );

  // Default to first (most recently used) exercise. If the user picks one
  // and then it disappears from the list (workout deleted), fall back.
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked && names.includes(picked) ? picked : names[0] ?? null;

  const trend = useMemo(
    () => (selected ? selectExerciseTrend(workouts, selected, rangeDays) : []),
    [workouts, selected, rangeDays],
  );

  const delta = useMemo(() => {
    if (trend.length < 2) return null;
    return +(trend[trend.length - 1].topWeight - trend[0].topWeight).toFixed(1);
  }, [trend]);

  const pr = useMemo(() => {
    if (trend.length === 0) return null;
    return trend.reduce((a, b) => (b.topWeight > a.topWeight ? b : a));
  }, [trend]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Dumbbell size={13} className="text-accent" />
        <h2 className="text-2xs uppercase tracking-widest text-ink-muted">
          Training
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <Stat
            label="Sessions"
            value={summary.sessions}
            unit={summary.sessions === 1 ? "day" : "days"}
          />
        </Card>
        <Card className="p-4">
          <Stat label="Sets" value={summary.totalSets} />
        </Card>
        <Card className="p-4">
          <Stat
            label="Volume"
            value={Math.round(summary.totalVolume).toLocaleString()}
            unit={unit}
          />
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Top set by exercise"
          subtitle={
            selected
              ? `${selected}${
                  delta !== null
                    ? ` · ${delta >= 0 ? "+" : ""}${delta} ${unit} over range`
                    : ""
                }`
              : "Pick an exercise to view progression"
          }
        />
        <CardBody>
          {names.length === 0 ? (
            <Empty
              title="No exercises logged yet"
              hint="Log a workout with at least one completed set to see trends."
            />
          ) : (
            <>
              {/* Exercise picker chips. Scrolls horizontally on overflow so
                  the chart below stays full-width. */}
              <div className="-mx-4 px-4 mb-3 flex gap-1.5 overflow-x-auto pb-1">
                {names.map((n) => {
                  const active = n === selected;
                  return (
                    <button
                      key={n}
                      onClick={() => setPicked(n)}
                      className={[
                        "shrink-0 px-3 h-8 rounded-full text-xs font-medium transition-colors border",
                        active
                          ? "bg-accent text-accent-ink border-accent"
                          : "bg-bg-elev text-ink-muted border-line hover:text-ink hover:bg-bg-hover",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              {trend.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-ink-dim">
                  No data in this range.
                </div>
              ) : trend.length < 2 ? (
                <div className="space-y-2">
                  <div className="h-32 flex items-center justify-center text-xs text-ink-dim">
                    One more session needed to plot a trend.
                  </div>
                  {pr && (
                    <p className="text-xs text-ink-muted tabular-nums">
                      Latest · {format(parseISO(trend[0].date), "MMM d")} ·{" "}
                      <span className="text-ink">
                        {trend[0].topWeight}
                        {unit} × {trend[0].topReps}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <ExerciseChart data={trend} unit={unit} pr={pr} />
              )}
            </>
          )}
        </CardBody>
      </Card>
    </section>
  );
}

function ExerciseChart({
  data,
  unit,
  pr,
}: {
  data: { date: string; topWeight: number; topReps: number; volume: number }[];
  unit: string;
  pr: { date: string; topWeight: number; topReps: number } | null;
}) {
  const weights = data.map((p) => p.topWeight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = Math.max(2.5, (max - min) * 0.2);

  return (
    <div>
      <div className="h-44 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="exerciseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B9BD5" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#5B9BD5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#E5DCC4"
              strokeDasharray="2 4"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => format(parseISO(d), "MMM d")}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A4B7", fontSize: 10 }}
              minTickGap={28}
            />
            <YAxis
              domain={[Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A4B7", fontSize: 10 }}
              width={28}
            />
            <Tooltip
              cursor={{ stroke: "#C9BE9F", strokeWidth: 1 }}
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
              formatter={(value: number, name, item) => {
                if (name === "topWeight") {
                  const reps = item?.payload?.topReps;
                  return [
                    `${value}${unit}${reps ? ` × ${reps}` : ""}`,
                    "Top set",
                  ];
                }
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="topWeight"
              stroke="#5B9BD5"
              strokeWidth={2}
              fill="url(#exerciseFill)"
              dot={{ r: 2.5, fill: "#5B9BD5", stroke: "none" }}
              activeDot={{
                r: 4,
                fill: "#5B9BD5",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {pr && (
        <p className="mt-2 text-2xs text-ink-dim tabular-nums">
          PR · {format(parseISO(pr.date), "MMM d")} ·{" "}
          <span className="text-ink">
            {pr.topWeight}
            {unit} × {pr.topReps}
          </span>
        </p>
      )}
    </div>
  );
}
