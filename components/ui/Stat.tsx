import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  unit,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { delta: number; suffix?: string };
  className?: string;
}) {
  const trendColor =
    trend === undefined
      ? ""
      : trend.delta === 0
      ? "text-ink-dim"
      : trend.delta > 0
      ? "text-ok"
      : "text-danger";
  const arrow =
    trend === undefined ? "" : trend.delta === 0 ? "→" : trend.delta > 0 ? "↑" : "↓";

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-2xs uppercase tracking-widest text-ink-dim">
        {label}
      </span>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-ink tabular-nums tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs text-ink-muted">{unit}</span>}
      </div>
      {trend && (
        <span className={cn("mt-0.5 text-2xs tabular-nums", trendColor)}>
          {arrow} {Math.abs(trend.delta).toFixed(1)}
          {trend.suffix}
        </span>
      )}
    </div>
  );
}

// ProgressBar — flat bar, accent fill, no animation distractions.
export function ProgressBar({
  value,
  className,
}: {
  value: number; // 0..1
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "h-1.5 w-full bg-bg-elev rounded-full overflow-hidden",
        className,
      )}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
