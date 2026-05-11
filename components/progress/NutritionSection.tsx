"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Stat } from "@/components/ui/Stat";
import {
  selectNutritionAverages,
  selectNutritionTrend,
  useStore,
} from "@/lib/store";
import { format, parseISO } from "date-fns";
import { Apple } from "lucide-react";
import { useMemo } from "react";
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

interface Props {
  rangeDays: number;
}

export function NutritionSection({ rangeDays }: Props) {
  const food = useStore((s) => s.food);
  const settings = useStore((s) => s.settings);

  const trend = useMemo(
    () => selectNutritionTrend(food, rangeDays),
    [food, rangeDays],
  );
  const avg = useMemo(
    () =>
      selectNutritionAverages(
        trend,
        settings.calorieTarget,
        settings.proteinTarget,
      ),
    [trend, settings.calorieTarget, settings.proteinTarget],
  );

  const hasData = avg.daysLogged > 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Apple size={13} className="text-accent" />
        <h2 className="text-2xs uppercase tracking-widest text-ink-muted">
          Nutrition
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <Stat
            label="Avg calories"
            value={hasData ? avg.avgCalories.toLocaleString() : "—"}
            unit={hasData ? `/ ${settings.calorieTarget}` : undefined}
          />
          {hasData && (
            <p className="text-2xs text-ink-dim mt-2 tabular-nums">
              On target {avg.daysHitCalories}/{avg.daysLogged} days
            </p>
          )}
        </Card>
        <Card className="p-4">
          <Stat
            label="Avg protein"
            value={hasData ? avg.avgProtein : "—"}
            unit={hasData ? `/ ${settings.proteinTarget}g` : undefined}
          />
          {hasData && (
            <p className="text-2xs text-ink-dim mt-2 tabular-nums">
              Hit target {avg.daysHitProtein}/{avg.daysLogged} days
            </p>
          )}
        </Card>
      </div>

      {!hasData ? (
        <Empty
          title="No food logged in this range"
          hint="Log a few days on the Food tab to see your averages and daily trend."
        />
      ) : (
        <>
          <Card>
            <CardHeader
              title="Calories"
              subtitle={`Daily kcal · target ${settings.calorieTarget}`}
            />
            <CardBody>
              <DailyBarChart
                data={trend}
                dataKey="calories"
                target={settings.calorieTarget}
                unit="kcal"
                label="Calories"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Protein"
              subtitle={`Daily grams · target ${settings.proteinTarget}g`}
            />
            <CardBody>
              <DailyBarChart
                data={trend}
                dataKey="protein"
                target={settings.proteinTarget}
                unit="g"
                label="Protein"
              />
            </CardBody>
          </Card>
        </>
      )}
    </section>
  );
}

interface BarPoint {
  date: string;
  calories: number;
  protein: number;
}

function DailyBarChart({
  data,
  dataKey,
  target,
  unit,
  label,
}: {
  data: BarPoint[];
  dataKey: "calories" | "protein";
  target: number;
  unit: string;
  label: string;
}) {
  // Trim large empty leading tails — if user only started logging halfway
  // through the range, show from first non-zero day to keep the chart dense.
  const firstNonZero = data.findIndex((p) => p[dataKey] > 0);
  const trimmed =
    firstNonZero > 0 ? data.slice(Math.max(0, firstNonZero - 1)) : data;

  const values = trimmed.map((p) => p[dataKey]);
  const max = Math.max(target, ...values);

  return (
    <div className="h-40 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={trimmed}
          margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            stroke="#E5DCC4"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(parseISO(d), "d")}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A4B7", fontSize: 10 }}
            minTickGap={12}
          />
          <YAxis
            domain={[0, Math.ceil(max * 1.1)]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A4B7", fontSize: 10 }}
            width={32}
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
            formatter={(value: number) => [`${value} ${unit}`, label]}
          />
          <ReferenceLine
            y={target}
            stroke="#5D7185"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Bar
            dataKey={dataKey}
            fill="#5B9BD5"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
