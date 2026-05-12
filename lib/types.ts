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

export interface CardioEntry {
  id: ID;
  type: string;               // e.g. "Running", "Cycling", or user-typed
  duration: number;           // minutes
  distance?: number;          // optional — km (when weight unit is kg) or mi (when lb)
}

export interface Workout {
  id: ID;
  title: string;              // user-provided e.g. "Push Day"
  date: DateKey;
  startedAt: string;          // ISO
  endedAt?: string;           // ISO
  exercises: Exercise[];
  cardio?: CardioEntry[];     // optional — older saved workouts won't have this
  // Counts as a "gym day" for the weekly tracker when either exercises or
  // cardio entries are present.
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

/**
 * Quality is a 4-point ordinal scale:
 *   1 = Poor, 2 = Fair, 3 = Good, 4 = Great.
 * Kept simple so users pick fast and so we can colour-bucket the chart
 * without arguing about gradients.
 */
export type SleepQuality = 1 | 2 | 3 | 4;

export interface SleepEntry {
  id: ID;
  date: DateKey;              // the date the user woke up
  hours: number;              // total sleep duration in hours (decimal ok, e.g. 7.5)
  quality: SleepQuality;
  note?: string;
}
