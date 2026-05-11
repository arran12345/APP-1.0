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
  SleepEntry,
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
  sleep: SleepEntry[];

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

  // --- sleep -------------------------------------------------------------
  // Upserts: one entry per date — re-logging the same date replaces it.
  logSleep: (s: Omit<SleepEntry, "id">) => void;
  removeSleep: (id: string) => void;
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
      sleep: [],

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

      logSleep: (entry) =>
        set((s) => {
          // Upsert by date — at most one sleep entry per day. If the user
          // re-logs the same morning we treat it as a correction.
          const filtered = s.sleep.filter((x) => x.date !== entry.date);
          return { sleep: [{ id: uid(), ...entry }, ...filtered] };
        }),
      removeSleep: (id) =>
        set((s) => ({ sleep: s.sleep.filter((x) => x.id !== id) })),
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

// ---------------------------------------------------------------------------
// Progress page selectors — training & nutrition trends.
// ---------------------------------------------------------------------------

export interface ExerciseTrendPoint {
  date: DateKey;
  topWeight: number;   // best weight × reps set that day (by weight, tiebreak reps)
  topReps: number;
  volume: number;      // total kg lifted for done sets that day
}

/**
 * Per-day aggregates for an exercise over the past `days`. Multiple workouts
 * on the same day collapse into one point (max top weight, summed volume).
 * Returned oldest-first so charts render left→right.
 */
export function selectExerciseTrend(
  workouts: Workout[],
  name: string,
  days: number,
): ExerciseTrendPoint[] {
  const target = name.trim().toLowerCase();
  const cutoff = addDays(new Date(), -days);
  const byDate = new Map<DateKey, ExerciseTrendPoint>();
  for (const w of workouts) {
    if (parseISO(w.date) < cutoff) continue;
    for (const e of w.exercises) {
      if (e.name.trim().toLowerCase() !== target) continue;
      const done = e.sets.filter((s) => s.done);
      if (done.length === 0) continue;
      const top = done.reduce((a, b) =>
        b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a,
      );
      const vol = done.reduce((sum, s) => sum + s.reps * s.weight, 0);
      const cur = byDate.get(w.date);
      if (!cur) {
        byDate.set(w.date, {
          date: w.date,
          topWeight: top.weight,
          topReps: top.reps,
          volume: vol,
        });
      } else {
        if (top.weight > cur.topWeight) {
          cur.topWeight = top.weight;
          cur.topReps = top.reps;
        }
        cur.volume += vol;
      }
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );
}

/** Unique exercise names across all workouts, sorted by most recent use. */
export function selectExerciseNames(workouts: Workout[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const w of workouts) {
    for (const e of w.exercises) {
      const n = e.name.trim();
      if (!n || seen.has(n)) continue;
      seen.add(n);
      ordered.push(n);
    }
  }
  return ordered;
}

export interface NutritionTrendPoint {
  date: DateKey;
  calories: number;
  protein: number;
}

/**
 * Per-day calorie + protein totals for the last `days` days, with zero-filled
 * gaps so charts don't compress sparse data.
 */
export function selectNutritionTrend(
  food: FoodEntry[],
  days: number,
): NutritionTrendPoint[] {
  const today = new Date();
  // Build a same-day lookup once, then walk the date range.
  const byDate = new Map<DateKey, NutritionTrendPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const k = toKey(addDays(today, -i));
    byDate.set(k, { date: k, calories: 0, protein: 0 });
  }
  for (const f of food) {
    const slot = byDate.get(f.date);
    if (!slot) continue;
    slot.calories += f.calories;
    slot.protein += f.protein;
  }
  return Array.from(byDate.values());
}

export interface NutritionAverages {
  avgCalories: number;
  avgProtein: number;
  daysLogged: number;
  daysHitCalories: number;
  daysHitProtein: number;
}

/** Averages over days that had ANY food logged (skipping zero-days). */
export function selectNutritionAverages(
  trend: NutritionTrendPoint[],
  calTarget: number,
  proTarget: number,
): NutritionAverages {
  const logged = trend.filter((p) => p.calories > 0 || p.protein > 0);
  const daysLogged = logged.length;
  if (daysLogged === 0) {
    return {
      avgCalories: 0,
      avgProtein: 0,
      daysLogged: 0,
      daysHitCalories: 0,
      daysHitProtein: 0,
    };
  }
  const sumCal = logged.reduce((s, p) => s + p.calories, 0);
  const sumPro = logged.reduce((s, p) => s + p.protein, 0);
  // "Hit" = within 10% of target either direction for calories; ≥ target for protein.
  const hitCal = logged.filter(
    (p) => Math.abs(p.calories - calTarget) <= calTarget * 0.1,
  ).length;
  const hitPro = logged.filter((p) => p.protein >= proTarget).length;
  return {
    avgCalories: Math.round(sumCal / daysLogged),
    avgProtein: Math.round(sumPro / daysLogged),
    daysLogged,
    daysHitCalories: hitCal,
    daysHitProtein: hitPro,
  };
}

export interface TrainingSummary {
  sessions: number;
  totalSets: number;
  totalVolume: number;
}

export function selectTrainingSummary(
  workouts: Workout[],
  days: number,
): TrainingSummary {
  const cutoff = addDays(new Date(), -days);
  const inRange = workouts.filter(
    (w) => parseISO(w.date) >= cutoff && w.exercises.length > 0,
  );
  let totalSets = 0;
  let totalVolume = 0;
  for (const w of inRange) {
    for (const e of w.exercises) {
      for (const s of e.sets) {
        if (!s.done) continue;
        totalSets += 1;
        totalVolume += s.reps * s.weight;
      }
    }
  }
  return { sessions: inRange.length, totalSets, totalVolume };
}

/**
 * For a given trend, the delta = last value − first value of the points that
 * actually have data. Used as the headline "you went up X" indicator.
 */
export function trendDelta(
  points: { value: number }[],
): number | null {
  const nonzero = points.filter((p) => p.value > 0);
  if (nonzero.length < 2) return null;
  return +(nonzero[nonzero.length - 1].value - nonzero[0].value).toFixed(1);
}

// ---------------------------------------------------------------------------
// Sleep selectors
// ---------------------------------------------------------------------------

export interface SleepTrendPoint {
  date: DateKey;
  hours: number;        // 0 for nights with no log
  quality: number;      // 0 for nights with no log
}

/**
 * Per-day sleep series for the past `days` days, zero-filled for nights
 * the user didn't log. Oldest-first so charts render left → right.
 */
export function selectSleepTrend(
  sleep: SleepEntry[],
  days: number,
): SleepTrendPoint[] {
  const today = new Date();
  const byDate = new Map<DateKey, SleepTrendPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const k = toKey(addDays(today, -i));
    byDate.set(k, { date: k, hours: 0, quality: 0 });
  }
  for (const s of sleep) {
    const slot = byDate.get(s.date);
    if (!slot) continue;
    slot.hours = s.hours;
    slot.quality = s.quality;
  }
  return Array.from(byDate.values());
}

export interface SleepAverages {
  nightsLogged: number;
  avgHours: number;        // average across logged nights
  avgQuality: number;      // 1..4
}

export function selectSleepAverages(trend: SleepTrendPoint[]): SleepAverages {
  const logged = trend.filter((p) => p.hours > 0);
  if (logged.length === 0) {
    return { nightsLogged: 0, avgHours: 0, avgQuality: 0 };
  }
  const sumHours = logged.reduce((a, b) => a + b.hours, 0);
  const sumQ = logged.reduce((a, b) => a + b.quality, 0);
  return {
    nightsLogged: logged.length,
    avgHours: +(sumHours / logged.length).toFixed(1),
    avgQuality: +(sumQ / logged.length).toFixed(1),
  };
}

export function selectLatestSleep(sleep: SleepEntry[]): SleepEntry | undefined {
  if (sleep.length === 0) return undefined;
  return [...sleep].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}
