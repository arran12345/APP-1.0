"use client";

import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import {
  selectDaysSinceLastGym,
  selectFoodForDay,
  selectGymStreak,
  selectLatestMetric,
  useStore,
} from "@/lib/store";
import { todayKey } from "@/lib/date";

export function QuickStats() {
  const workouts = useStore((s) => s.workouts);
  const metrics = useStore((s) => s.metrics);
  const food = useStore((s) => s.food);
  const settings = useStore((s) => s.settings);

  const streak = selectGymStreak(workouts);
  const sinceLast = selectDaysSinceLastGym(workouts);
  const latest = selectLatestMetric(metrics);
  const day = selectFoodForDay(food, todayKey());

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-4">
        <Stat
          label="Streak"
          value={streak}
          unit={streak === 1 ? "day" : "days"}
        />
        <p className="text-2xs text-ink-dim mt-2">
          {sinceLast === null
            ? "Log a workout to begin"
            : sinceLast === 0
            ? "Trained today"
            : `Last: ${sinceLast}d ago`}
        </p>
      </Card>
      <Card className="p-4">
        <Stat
          label="Weight"
          value={latest?.weight ? latest.weight.toFixed(1) : "—"}
          unit={latest?.weight ? settings.unit : undefined}
        />
        <p className="text-2xs text-ink-dim mt-2">
          {latest?.bodyFat != null
            ? `BF ${latest.bodyFat.toFixed(1)}%`
            : "Tap Progress to log"}
        </p>
      </Card>
      <Card className="p-4 col-span-2">
        <div className="flex items-end justify-between">
          <Stat
            label="Today · kcal"
            value={day.calories || 0}
            unit={`/ ${settings.calorieTarget}`}
          />
          <Stat
            label="Protein"
            value={Math.round(day.protein)}
            unit={`/ ${settings.proteinTarget}g`}
            className="items-end text-right"
          />
        </div>
      </Card>
    </div>
  );
}
