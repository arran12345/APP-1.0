"use client";

import { Card, SectionLabel } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { useStore } from "@/lib/store";
import { fromKey, relativeLabel } from "@/lib/date";
import { ChevronRight, CircleDot } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useMemo } from "react";

export function WorkoutList() {
  const workouts = useStore((s) => s.workouts);

  // Group by month for readability — engineering-dashboard style.
  const groups = useMemo(() => {
    const map = new Map<string, typeof workouts>();
    for (const w of workouts) {
      const key = format(fromKey(w.date), "MMMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries());
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <Empty
        title="No workouts logged"
        hint="Tap Start workout above to begin your first session."
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([month, items]) => (
        <section key={month}>
          <SectionLabel>{month}</SectionLabel>
          <Card className="divide-y divide-line overflow-hidden">
            {items.map((w) => {
              const totalSets = w.exercises.reduce(
                (s, e) => s + e.sets.length,
                0,
              );
              const doneSets = w.exercises.reduce(
                (s, e) => s + e.sets.filter((x) => x.done).length,
                0,
              );
              const cardioCount = w.cardio?.length ?? 0;
              const cardioMinutes = (w.cardio ?? []).reduce(
                (sum, c) => sum + c.duration,
                0,
              );
              const inProgress = !w.endedAt;
              // Build the summary string conditionally so cardio-only or
              // strength-only workouts read cleanly.
              const parts: string[] = [];
              if (w.exercises.length > 0) {
                parts.push(`${w.exercises.length} ex · ${doneSets}/${totalSets} sets`);
              }
              if (cardioCount > 0) {
                parts.push(`${cardioCount} cardio · ${cardioMinutes} min`);
              }
              const summary =
                parts.length > 0 ? parts.join(" · ") : "empty workout";
              return (
                <Link
                  key={w.id}
                  href={`/workouts/${w.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-ink truncate">{w.title}</p>
                      {inProgress && (
                        <span className="inline-flex items-center gap-1 text-2xs text-accent">
                          <CircleDot size={10} /> live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 tabular-nums">
                      {relativeLabel(w.date)} · {summary}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-ink-dim shrink-0" />
                </Link>
              );
            })}
          </Card>
        </section>
      ))}
    </div>
  );
}
