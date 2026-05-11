"use client";

import type { BodyMetric } from "@/lib/types";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Lightweight area chart styled to match the engineering-minimalist look.
// We render weight (primary) on the left axis; body fat is hidden when
// missing to avoid jagged lines from sparse data.

interface Point {
  date: string;
  weight: number | null;
  bodyFat: number | null;
}

export function MetricChart({
  data,
  unit,
}: {
  data: BodyMetric[];
  unit: string;
}) {
  const points: Point[] = data.map((m) => ({
    date: m.date,
    weight: m.weight ?? null,
    bodyFat: m.bodyFat ?? null,
  }));

  const weights = points
    .map((p) => p.weight)
    .filter((v): v is number => v != null);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = Math.max(0.5, (max - min) * 0.15);

  return (
    <div className="h-44 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3E635" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#A3E635" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#1F1F23"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(parseISO(d), "MMM d")}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A5A63", fontSize: 10 }}
            minTickGap={28}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A5A63", fontSize: 10 }}
            width={28}
          />
          <Tooltip
            cursor={{ stroke: "#2A2A30", strokeWidth: 1 }}
            contentStyle={{
              background: "#141416",
              border: "1px solid #2A2A30",
              borderRadius: 8,
              fontSize: 12,
              color: "#F5F5F7",
              padding: "6px 10px",
            }}
            labelFormatter={(d) => format(parseISO(d as string), "EEE, MMM d")}
            formatter={(value: number, name) => {
              if (name === "weight") return [`${value} ${unit}`, "Weight"];
              if (name === "bodyFat") return [`${value}%`, "Body fat"];
              return [value, name];
            }}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#A3E635"
            strokeWidth={2}
            fill="url(#weightFill)"
            connectNulls
            dot={{ r: 2.5, fill: "#A3E635", stroke: "none" }}
            activeDot={{ r: 4, fill: "#A3E635", stroke: "#0A0A0B", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
