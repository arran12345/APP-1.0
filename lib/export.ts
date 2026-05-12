// PDF report generator.
//
// Design goals:
// - **Optimised for AI consumption.** The PDF is text-only, no images, with
//   labelled sections and clean tables so a model can OCR/parse it reliably.
//   We deliberately don't try to make it pretty.
// - **Lazy-loaded.** jsPDF + jspdf-autotable add ~230KB gzipped. The dynamic
//   import in `downloadReport()` keeps that out of the main bundle — users
//   who never export pay nothing.
// - **Self-contained.** Takes a snapshot of store state plus a window in
//   days. No async store reads, no further selectors needed at call time.

import { addDays, format } from "date-fns";
import {
  selectNutritionAverages,
  selectNutritionTrend,
  selectSleepAverages,
  selectSleepTrend,
  selectTrainingSummary,
} from "./store";
import type {
  BodyMetric,
  FoodEntry,
  Settings,
  SleepEntry,
  Workout,
} from "./types";

export type ReportRange = 7 | 30 | 90;

export interface ReportState {
  settings: Settings;
  workouts: Workout[];
  metrics: BodyMetric[];
  food: FoodEntry[];
  sleep: SleepEntry[];
}

const QUALITY_LABELS = ["—", "Poor", "Fair", "Good", "Great"] as const;
const ACCENT_FILL: [number, number, number] = [91, 155, 213];
const SUBHEAD_FILL: [number, number, number] = [240, 234, 211];
const MARGIN = { left: 40, right: 40 };

/**
 * Build a PDF report for the given window and trigger a browser download.
 * Returns the filename used.
 */
export async function downloadReport(
  days: ReportRange,
  state: ReportState,
): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const autoTableMod = await import("jspdf-autotable");
  // jspdf-autotable exports the function as the module's default export.
  const autoTable = autoTableMod.default as (
    doc: import("jspdf").jsPDF,
    options: Parameters<typeof autoTableMod.default>[1],
  ) => void;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const today = new Date();
  const start = addDays(today, -(days - 1));
  const fmtDate = (d: Date) => format(d, "yyyy-MM-dd");
  const startKey = fmtDate(start);
  const todayKey = fmtDate(today);

  // ----- Filter state to the requested window ----------------------------
  const inWindow = (k: string) => k >= startKey && k <= todayKey;
  const workouts = state.workouts.filter((w) => inWindow(w.date));
  const food = state.food.filter((f) => inWindow(f.date));
  const sleep = state.sleep.filter((s) => inWindow(s.date));
  const metrics = state.metrics.filter((m) => inWindow(m.date));
  const unit = state.settings.unit;
  const distanceUnit = unit === "kg" ? "km" : "mi";

  // ----- Page header (top of page 1) -------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Pulse — Fitness Report", 40, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(
    `Range: ${startKey} → ${todayKey} (${days} days)    Generated: ${format(today, "yyyy-MM-dd HH:mm")}    Unit: ${unit}`,
    40,
    68,
  );
  doc.setTextColor(0);

  // ----- Summary --------------------------------------------------------
  const training = selectTrainingSummary(state.workouts, days);
  const nutritionTrend = selectNutritionTrend(state.food, days);
  const nutritionAvg = selectNutritionAverages(
    nutritionTrend,
    state.settings.calorieTarget,
    state.settings.proteinTarget,
  );
  const sleepTrend = selectSleepTrend(state.sleep, days);
  const sleepAvg = selectSleepAverages(sleepTrend);

  const sortedMetrics = [...metrics].sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );
  const firstMetric = sortedMetrics[0];
  const lastMetric = sortedMetrics[sortedMetrics.length - 1];
  const weightDelta =
    firstMetric?.weight != null && lastMetric?.weight != null
      ? +(lastMetric.weight - firstMetric.weight).toFixed(1)
      : null;
  const bfDelta =
    firstMetric?.bodyFat != null && lastMetric?.bodyFat != null
      ? +(lastMetric.bodyFat - firstMetric.bodyFat).toFixed(1)
      : null;

  // Cardio summary across the window
  let cardioCount = 0;
  let cardioMinutes = 0;
  let cardioDistance = 0;
  for (const w of workouts) {
    for (const c of w.cardio ?? []) {
      cardioCount += 1;
      cardioMinutes += c.duration;
      if (c.distance != null) cardioDistance += c.distance;
    }
  }

  const summaryRows: [string, string][] = [
    ["TRAINING", ""],
    ["  Sessions", String(training.sessions)],
    ["  Sets done", String(training.totalSets)],
    [
      `  Total volume (${unit})`,
      Math.round(training.totalVolume).toLocaleString(),
    ],
    ["  Cardio sessions", String(cardioCount)],
    [
      "  Total cardio time",
      cardioCount > 0 ? `${cardioMinutes} min` : "—",
    ],
    [
      `  Total cardio distance (${distanceUnit})`,
      cardioDistance > 0 ? cardioDistance.toFixed(2) : "—",
    ],
    ["", ""],
    ["NUTRITION", ""],
    ["  Days logged", `${nutritionAvg.daysLogged} / ${days}`],
    [
      "  Avg calories",
      nutritionAvg.daysLogged
        ? `${nutritionAvg.avgCalories} (target ${state.settings.calorieTarget})`
        : "—",
    ],
    [
      "  Avg protein",
      nutritionAvg.daysLogged
        ? `${nutritionAvg.avgProtein} g (target ${state.settings.proteinTarget} g)`
        : "—",
    ],
    [
      "  Days on calorie target (±10%)",
      nutritionAvg.daysLogged
        ? `${nutritionAvg.daysHitCalories} / ${nutritionAvg.daysLogged}`
        : "—",
    ],
    [
      "  Days hit protein target",
      nutritionAvg.daysLogged
        ? `${nutritionAvg.daysHitProtein} / ${nutritionAvg.daysLogged}`
        : "—",
    ],
    ["", ""],
    ["SLEEP", ""],
    ["  Nights logged", `${sleepAvg.nightsLogged} / ${days}`],
    [
      "  Avg hours",
      sleepAvg.nightsLogged ? `${sleepAvg.avgHours.toFixed(1)} h` : "—",
    ],
    [
      "  Avg quality",
      sleepAvg.nightsLogged
        ? `${sleepAvg.avgQuality.toFixed(1)} / 4 (${avgQualityLabel(sleepAvg.avgQuality)})`
        : "—",
    ],
    ["", ""],
    ["BODY", ""],
    [
      "  Latest weight",
      lastMetric?.weight != null
        ? `${lastMetric.weight} ${unit}${
            weightDelta !== null
              ? ` (Δ ${weightDelta > 0 ? "+" : ""}${weightDelta} ${unit})`
              : ""
          }`
        : "—",
    ],
    [
      "  Latest body fat",
      lastMetric?.bodyFat != null
        ? `${lastMetric.bodyFat}%${
            bfDelta !== null
              ? ` (Δ ${bfDelta > 0 ? "+" : ""}${bfDelta}%)`
              : ""
          }`
        : "—",
    ],
  ];

  autoTable(doc, {
    startY: 90,
    head: [["Summary", ""]],
    body: summaryRows,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fontStyle: "bold", fillColor: SUBHEAD_FILL },
    columnStyles: { 0: { cellWidth: 220 }, 1: { cellWidth: "auto" } },
    margin: MARGIN,
  });

  // ----- Workouts -------------------------------------------------------
  if (workouts.length > 0) {
    sectionHeading(autoTable, doc, "Workouts");
    const sortedWorkouts = [...workouts].sort((a, b) =>
      a.date < b.date ? -1 : 1,
    );

    autoTable(doc, {
      head: [
        [
          "Date",
          "Title",
          "Ex",
          "Sets",
          `Vol (${unit})`,
          "Cardio",
          "Min",
        ],
      ],
      body: sortedWorkouts.map((w) => {
        let sets = 0;
        let vol = 0;
        for (const e of w.exercises) {
          for (const s of e.sets) {
            if (!s.done) continue;
            sets += 1;
            vol += s.reps * s.weight;
          }
        }
        const cCount = w.cardio?.length ?? 0;
        const cMins = (w.cardio ?? []).reduce((sum, c) => sum + c.duration, 0);
        return [
          w.date,
          w.title,
          String(w.exercises.length),
          String(sets),
          Math.round(vol).toLocaleString(),
          String(cCount),
          cCount > 0 ? String(cMins) : "—",
        ];
      }),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: ACCENT_FILL, textColor: 255 },
      margin: MARGIN,
    });

    // Per-workout exercise/set breakdown + cardio
    for (const w of sortedWorkouts) {
      subheading(autoTable, doc, `${w.date} · ${w.title}`);
      for (const e of w.exercises) {
        autoTable(doc, {
          head: [[e.name, `Weight (${unit})`, "Reps", "Done"]],
          body: e.sets.map((s, i) => [
            String(i + 1),
            String(s.weight),
            String(s.reps),
            s.done ? "yes" : "no",
          ]),
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: SUBHEAD_FILL, textColor: 30 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 90 },
            2: { cellWidth: 60 },
            3: { cellWidth: 50 },
          },
          margin: MARGIN,
        });
      }
      if (w.cardio && w.cardio.length > 0) {
        autoTable(doc, {
          head: [
            ["Cardio", "Duration (min)", `Distance (${distanceUnit})`],
          ],
          body: w.cardio.map((c) => [
            c.type,
            String(c.duration),
            c.distance != null ? String(c.distance) : "—",
          ]),
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: SUBHEAD_FILL, textColor: 30 },
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 90 },
            2: { cellWidth: 90 },
          },
          margin: MARGIN,
        });
      }
    }
  }

  // ----- Nutrition log -------------------------------------------------
  if (food.length > 0) {
    sectionHeading(autoTable, doc, "Nutrition log");

    const sortedTrend = nutritionTrend.filter(
      (p) => p.calories > 0 || p.protein > 0,
    );
    if (sortedTrend.length > 0) {
      autoTable(doc, {
        head: [["Date", "Calories", "Protein (g)", "Items"]],
        body: sortedTrend.map((p) => {
          const items = food.filter((f) => f.date === p.date).length;
          return [
            p.date,
            String(p.calories),
            String(Math.round(p.protein)),
            String(items),
          ];
        }),
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: ACCENT_FILL, textColor: 255 },
        margin: MARGIN,
      });
    }

    // Per-day item detail
    const groupedByDate = new Map<string, FoodEntry[]>();
    for (const f of food) {
      if (!groupedByDate.has(f.date)) groupedByDate.set(f.date, []);
      groupedByDate.get(f.date)!.push(f);
    }
    const orderedDates = Array.from(groupedByDate.keys()).sort();
    for (const date of orderedDates) {
      const items = groupedByDate.get(date)!;
      autoTable(doc, {
        head: [[date, "Calories", "Protein (g)"]],
        body: items.map((f) => [
          f.name,
          String(f.calories),
          String(Math.round(f.protein)),
        ]),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: SUBHEAD_FILL, textColor: 30 },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 80 },
          2: { cellWidth: 80 },
        },
        margin: MARGIN,
      });
    }
  }

  // ----- Sleep log -----------------------------------------------------
  if (sleep.length > 0) {
    sectionHeading(autoTable, doc, "Sleep log");
    autoTable(doc, {
      head: [["Date", "Hours", "Quality"]],
      body: [...sleep]
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((s) => [
          s.date,
          s.hours.toFixed(2),
          `${s.quality} · ${QUALITY_LABELS[s.quality]}`,
        ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: ACCENT_FILL, textColor: 255 },
      margin: MARGIN,
    });
  }

  // ----- Body metrics --------------------------------------------------
  if (metrics.length > 0) {
    sectionHeading(autoTable, doc, "Body metrics");
    autoTable(doc, {
      head: [["Date", `Weight (${unit})`, "Body fat (%)"]],
      body: sortedMetrics.map((m) => [
        m.date,
        m.weight != null ? String(m.weight) : "—",
        m.bodyFat != null ? String(m.bodyFat) : "—",
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: ACCENT_FILL, textColor: 255 },
      margin: MARGIN,
    });
  }

  // ----- Footer page numbers ------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Pulse · page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
  }

  const filename = `pulse-${days}d-${todayKey}.pdf`;
  doc.save(filename);
  return filename;
}

// --------------------------------------------------------------------------
// Helpers — single-row plain tables let autoTable handle page-break math
// for us. Manual doc.text() positioning was fragile across page boundaries.
// --------------------------------------------------------------------------

type AutoTableFn = (
  doc: import("jspdf").jsPDF,
  options: object,
) => void;

function sectionHeading(
  at: AutoTableFn,
  doc: import("jspdf").jsPDF,
  title: string,
): void {
  at(doc, {
    body: [[title]],
    theme: "plain",
    styles: {
      fontSize: 13,
      fontStyle: "bold",
      cellPadding: { top: 16, bottom: 6, left: 0, right: 0 },
    },
    margin: MARGIN,
  });
}

function subheading(
  at: AutoTableFn,
  doc: import("jspdf").jsPDF,
  title: string,
): void {
  at(doc, {
    body: [[title]],
    theme: "plain",
    styles: {
      fontSize: 10,
      fontStyle: "bold",
      cellPadding: { top: 10, bottom: 2, left: 0, right: 0 },
    },
    margin: MARGIN,
  });
}

function avgQualityLabel(score: number): string {
  if (score >= 3.5) return "Great";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Fair";
  return "Poor";
}
