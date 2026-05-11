"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uid } from "./utils";
import { todayKey, toKey, weekDays, fromKey } from "./date";
import type {
  BodyMetric,
  DateKey,
  Exercise,
  ExerciseSet,
  FoodEntry,
  Settings,
  Workout,
} from "./types";
import { addDays, differenceInCalendarDays, parseISO } from "date-fns";

// ---------------------------------------------------------------------------
// Architecture
// ---------------------------------------------------------------------------
// One global store, persisted to localStorage. Actions are pure transitions
// over `set`; derived data (streak, weekly progress, last-time-on-exercise)
// is computed by selectors below so the cache stays single-sourced.
//
// We don't expose the entire state to components — components subscribe to
// fine-grained selectors to minimize re-renders.
// ---------------------------------------------------------------------------

interface State {
  settings: Settings;
  workouts: Workout[];
  metrics: BodyMetric[];
  food: FoodEntry[];

  // --- settings ----------------------------------------------------------
  updateSettings: (patch: Partial<Settings>) => void;

  // --- workouts ----------------------------------------------------------
  startWorkout: (title: string) => string;
  renameWorkout: (id: string, title: string) => void;
  endWorkout: (id: string) => void;
  deleteWorkout: (id: string) => void;
  addExercise: (workoutId: string, name: string) => string;
  renameExercise: (workoutId: string, exerciseId: string, name: string) => void;
  removeExercise: (workoutId: string, exerciseId: string) => void;
  addSet: (
    workoutId: string,
    exerciseId: string,
    set?: Partial<Omit<ExerciseSet, "id">>,
  ) => void;
  updateSet: (
    workoutId: string,
    exerciseId: string,
    setId: string,
    patch: Partial<Omit<ExerciseSet, "id">>,
  ) => void;
  toggleSet: (workoutId: string, exerciseId: string, setId: string) => void;
  removeSet: (workoutId: string, exerciseId: string, setId: string) => void;

  // --- metrics -----------------------------------------------------------
  logMetric: (m: Omit<BodyMetric, "id">) => void;
  removeMetric: (id: string) => void;

  // --- food --------------------------------------------------------------
  logFood: (f: Omit<FoodEntry, "id">) => void;
  removeFood: (id: string) => void;
}

const DEFAULT_SETTINGS: Settings = {
  weeklyGoal: 4,
  unit: "kg",
  proteinTarget: 160,
  calorieTarget: 2400,
  weekStartsOn: 1,
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      workouts: [],
      metrics: [],
      food: [],

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      startWorkout: (title) => {
        const id = uid();
        const now = new Date();
        const w: Workout = {
          id,
          title: title.trim() || "Workout",
          date: todayKey(),
          startedAt: now.toISOString(),
          exercises: [],
        };
        set((s) => ({ workouts: [w, ...s.workouts] }));
        return id;
      },
      renameWorkout: (id, title) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === id ? { ...w, title: title.trim() || w.title } : w,
          ),
        })),
      endWorkout: (id) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === id ? { ...w, endedAt: new Date().toISOString() } : w,
          ),
        })),
      deleteWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addExercise: (workoutId, name) => {
        const exId = uid();
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id !== workoutId
              ? w
              : {
                  ...w,
                  exercises: [
                    ...w.exercises,
                    { id: exId, name: name.trim() || "Exercise", sets: [] },
                  ],
                },
          ),
        }));
        return exId;
      },
      renameExercise: (workoutId, exerciseId, name) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id !== workoutId
              ? w
              : {
                  ...w,
                  exercises: w.exercises.map((e) =>
                    e.id === exerciseId
                      ? { ...e, name: name.trim() || e.name }
                      : e,
                  ),
                },
          ),
        })),
      removeExercise: (workoutId, exerciseId) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id !== workoutId
              ? w
              : { ...w, exercises: w.exercises.filter((e) => e.id !== exerciseId) },
          ),
        })),

      addSet: (workoutId, exerciseId, init) =>
        set((s) => ({
          workouts: s.workouts.map((w) => {
            if (w.id !== workoutId) return w;
            return {
              ...w,
              exercises: w.exercises.map((e) => {
                if (e.id !== exerciseId) return e;
                // Carry forward the previous set's weight/reps for speed.
                const prev = e.sets[e.sets.length - 1];
                const next: ExerciseSet = {
                  id: uid(),
                  reps: init?.reps ?? prev?.reps ?? 8,
                  weight: init?.weight ?? prev?.weight ?? 0,
                  done: init?.done ?? false,
                };
                return { ...e, sets: [...e.sets, next] };
              }),
            };
          }),
        })),
      updateSet: (workoutId, exerciseId, setId, patch) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id !== workoutId
              ? w
              : {
                  ...w,
                  exercises: w.exercises.map((e) =>
                    e.id !== exerciseId
                      ? e
                      : {
                          ...e,
                          sets: e.sets.map((st) =>
                            st.id === setId ? { ...st, ...patch } : st,
                          ),
                        },
                  ),
                },
          ),
        })),
      toggleSet: (workoutId, exerciseId, setId) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id !== workoutId
              ? w
              : {
                  ...w,
                  exercises: w.exercises.map((e) =>
                    e.id !== exerciseId
                      ? e
                      : {
                          ...e,
                          sets: e.sets.map((st) =>
                            st.id === setId ? { ...st, done: !st.done } : st,
                          ),
                        },
                  ),
                },
          ),
        })),
      removeSet: (workoutId, exerciseId, setId) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id !== workoutId
              ? w
              : {
                  ...w,
                  exercises: w.exercises.map((e) =>
                    e.id !== exerciseId
                      ? e
                      : { ...e, sets: e.sets.filter((st) => st.id !== setId) },
                  ),
                },
          ),
        })),

      logMetric: (m) =>
        set((s) => ({ metrics: [{ id: uid(), ...m }, ...s.metrics] })),
      removeMetric: (id) =>
        set((s) => ({ metrics: s.metrics.filter((m) => m.id !== id) })),

      logFood: (f) =>
        set((s) => ({ food: [{ id: uid(), ...f }, ...s.food] })),
      removeFood: (id) =>
        set((s) => ({ food: s.food.filter((f) => f.id !== id) })),
    }),
    {
      name: "pulse:v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

// ---------------------------------------------------------------------------
// Selectors (pure functions over state — keep components dumb)
// ---------------------------------------------------------------------------

export function isGymDay(workouts: Workout[], key: DateKey): boolean {
  return workouts.some((w) => w.date === key && w.exercises.length > 0);
}

export interface WeekStatus {
  days: { key: DateKey; isGym: boolean }[];
  completed: number;
  goal: number;
  pct: number; // 0..1
}

export function selectWeekStatus(
  workouts: Workout[],
  weekStartsOn: 0 | 1,
  goal: number,
): WeekStatus {
  const days = weekDays(weekStartsOn).map((key) => ({
    key,
    isGym: isGymDay(workouts, key),
  }));
  const completed = days.filter((d) => d.isGym).length;
  const pct = goal > 0 ? Math.min(1, completed / goal) : 0;
  return { days, completed, goal, pct };
}

/**
 * Streak = consecutive days, walking backwards from today, where either:
 *   - a gym day occurred, OR
 *   - it's a "rest day" within the weekly cadence (we don't break streaks on
 *     rest days as long as the weekly goal is on pace).
 * For simplicity we count consecutive *gym* days from the most recent gym day,
 * which is the metric users most intuit as "streak".
 */
export function selectGymStreak(workouts: Workout[]): number {
  const gymDays = new Set(
    workouts.filter((w) => w.exercises.length > 0).map((w) => w.date),
  );
  if (gymDays.size === 0) return 0;
  // Walk back from today; tolerate a single rest day between gym sessions
  // so a normal lifter's streak doesn't reset on Wednesdays.
  let streak = 0;
  let cursor = new Date();
  let restBudget = 1;
  for (let i = 0; i < 365; i++) {
    const k = toKey(cursor);
    if (gymDays.has(k)) {
      streak++;
      restBudget = 1;
    } else {
      if (restBudget > 0 && streak > 0) {
        restBudget--;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface ExerciseHistoryRow {
  date: DateKey;
  workoutId: string;
  topSet: { reps: number; weight: number };
  volume: number; // sum(reps * weight) for done sets
}

/** Most recent N occurrences of an exercise (by name, case-insensitive). */
export function selectExerciseHistory(
  workouts: Workout[],
  name: string,
  limit = 5,
): ExerciseHistoryRow[] {
  const target = name.trim().toLowerCase();
  const rows: ExerciseHistoryRow[] = [];
  for (const w of workouts) {
    for (const e of w.exercises) {
      if (e.name.trim().toLowerCase() !== target) continue;
      const done = e.sets.filter((s) => s.done);
      if (done.length === 0) continue;
      const top = done.reduce((a, b) =>
        b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a,
      );
      const volume = done.reduce((sum, s) => sum + s.reps * s.weight, 0);
      rows.push({
        date: w.date,
        workoutId: w.id,
        topSet: { reps: top.reps, weight: top.weight },
        volume,
      });
    }
  }
  return rows
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

export function selectFoodForDay(food: FoodEntry[], key: DateKey) {
  const items = food.filter((f) => f.date === key);
  const calories = items.reduce((s, f) => s + f.calories, 0);
  const protein = items.reduce((s, f) => s + f.protein, 0);
  return { items, calories, protein };
}

export function selectMetricSeries(metrics: BodyMetric[], days = 60) {
  // Most recent first in storage; chart expects oldest-first.
  const cutoff = addDays(new Date(), -days);
  return [...metrics]
    .filter((m) => parseISO(m.date) >= cutoff)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function selectLatestMetric(metrics: BodyMetric[]): BodyMetric | undefined {
  if (metrics.length === 0) return undefined;
  return [...metrics].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}

/** Days since last gym session — useful for "consistency" warnings. */
export function selectDaysSinceLastGym(workouts: Workout[]): number | null {
  const last = workouts
    .filter((w) => w.exercises.length > 0)
    .map((w) => w.date)
    .sort()
    .at(-1);
  if (!last) return null;
  return differenceInCalendarDays(new Date(), fromKey(last));
}
