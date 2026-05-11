// Domain types for Pulse.
//
// Design notes:
// - All dates are stored as ISO YYYY-MM-DD (`DateKey`) for day-bucketed data,
//   or as full ISO timestamps for ordered events. This avoids timezone bugs
//   when bucketing by "day" across DST boundaries.
// - IDs are short nanoid-ish strings generated client-side; the data layer
//   never relies on a server.

export type DateKey = string; // "YYYY-MM-DD"
export type ID = string;

export type Unit = "kg" | "lb";

export interface Settings {
  weeklyGoal: number;         // gym sessions per week
  unit: Unit;                 // weights + bodyweight
  proteinTarget: number;      // grams/day
  calorieTarget: number;      // kcal/day
  weekStartsOn: 0 | 1;        // 0 = Sunday, 1 = Monday
}

export interface ExerciseSet {
  id: ID;
  reps: number;
  weight: number;             // in user's preferred unit
  done: boolean;
}

export interface Exercise {
  id: ID;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: ID;
  title: string;              // user-provided e.g. "Push Day"
  date: DateKey;
  startedAt: string;          // ISO
  endedAt?: string;           // ISO
  exercises: Exercise[];
  // Counts as a "gym day" for the weekly tracker once exercises exist.
}

export interface BodyMetric {
  id: ID;
  date: DateKey;
  weight?: number;            // bodyweight in preferred unit
  bodyFat?: number;           // percentage
}

export interface FoodEntry {
  id: ID;
  date: DateKey;
  name: string;
  calories: number;
  protein: number;            // grams
}
