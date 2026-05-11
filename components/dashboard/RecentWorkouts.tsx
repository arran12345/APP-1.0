"use client";

import { Card, SectionLabel } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { useStore } from "@/lib/store";
import { relativeLabel } from "@/lib/date";
import { ChevronRight, Dumbbell } from "lucide-react";
import Link from "next/link";

export function RecentWorkouts() {
  const workouts = useStore((s) => s.workouts);
  const recent = workouts.slice(0, 4);

  return (
    <section>
      <SectionLabel
        trailing={
          <Link
            href="/workouts"
            className="text-2xs text-ink-muted hover:text-ink"
          >
            View all
          </Link>
        }
      >
        Recent workouts
      </SectionLabel>
      {recent.length === 0 ? (
        <Empty
          title="No workouts yet"
          hint="Start one from the Workouts tab."
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {recent.map((w) => {
            const totalSets = w.exercises.reduce(
              (s, e) => s + e.sets.filter((x) => x.done).length,
              0,
            );
            return (
              <Link
                key={w.id}
                href={`/workouts/${w.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                <div className="h-8 w-8 rounded-md bg-bg-elev border border-line flex items-center justify-center shrink-0">
                  <Dumbbell size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{w.title}</p>
                  <p className="text-xs text-ink-muted">
                    {relativeLabel(w.date)} · {w.exercises.length} exercise
                    {w.exercises.length === 1 ? "" : "s"} · {totalSets} set
                    {totalSets === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-ink-dim shrink-0" />
              </Link>
            );
          })}
        </Card>
      )}
    </section>
  );
}
