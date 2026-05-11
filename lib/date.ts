import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek as dfStartOfWeek,
} from "date-fns";
import type { DateKey } from "./types";

// All app-level day math goes through these helpers so we stay consistent
// about local time and week-start handling.

export const todayKey = (): DateKey => format(new Date(), "yyyy-MM-dd");

export const toKey = (d: Date): DateKey => format(d, "yyyy-MM-dd");

export const fromKey = (k: DateKey): Date => parseISO(k);

export function startOfWeekKey(date: Date, weekStartsOn: 0 | 1): DateKey {
  return toKey(dfStartOfWeek(date, { weekStartsOn }));
}

export function weekDays(weekStartsOn: 0 | 1, ref: Date = new Date()): DateKey[] {
  const start = dfStartOfWeek(ref, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => toKey(addDays(start, i)));
}

export function shortWeekday(k: DateKey): string {
  // "Mon" / "Tue" — used in the weekly tracker.
  return format(fromKey(k), "EEE");
}

export function dayNum(k: DateKey): string {
  return format(fromKey(k), "d");
}

export function relativeLabel(k: DateKey): string {
  const diff = differenceInCalendarDays(new Date(), fromKey(k));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return format(fromKey(k), "MMM d");
}

export function fmtTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}
