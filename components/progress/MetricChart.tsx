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
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
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
            formatter={(value: number, name) => {
              if (name === "weight") return [`${value} ${unit}`, "Weight"];
              if (name === "bodyFat") return [`${value}%`, "Body fat"];
              return [value, name];
            }}
          />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#5B9BD5"
            strokeWidth={2}
            fill="url(#weightFill)"
            connectNulls
            dot={{ r: 2.5, fill: "#5B9BD5", stroke: "none" }}
            activeDot={{ r: 4, fill: "#5B9BD5", stroke: "#FFFFFF", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
