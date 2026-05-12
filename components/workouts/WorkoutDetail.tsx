"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardBody, SectionLabel } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { selectExerciseHistory, useStore } from "@/lib/store";
import { fmtTime, relativeLabel } from "@/lib/date";
import { ArrowLeft, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CardioSection } from "./CardioSection";
import { ExerciseBlock } from "./ExerciseBlock";

const EXERCISE_SUGGESTIONS = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Row",
  "Pull-up",
  "Lat Pulldown",
  "Leg Press",
  "Curl",
  "Tricep Extension",
];

export function WorkoutDetail({ id }: { id: string }) {
  const router = useRouter();
  const workout = useStore((s) => s.workouts.find((w) => w.id === id));
  const renameWorkout = useStore((s) => s.renameWorkout);
  const endWorkout = useStore((s) => s.endWorkout);
  const deleteWorkout = useStore((s) => s.deleteWorkout);
  const addExercise = useStore((s) => s.addExercise);
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);

  const [addOpen, setAddOpen] = useState(false);
  const [exName, setExName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(workout?.title ?? "");

  if (!workout) {
    return (
      <main className="app-container pt-10">
        <Empty
          title="Workout not found"
          action={
            <Button onClick={() => router.push("/workouts")}>
              Back to workouts
            </Button>
          }
        />
      </main>
    );
  }

  function add(name: string) {
    if (!name.trim()) return;
    addExercise(workout!.id, name);
    setExName("");
    setAddOpen(false);
  }

  const totalDoneSets = workout.exercises.reduce(
    (s, e) => s + e.sets.filter((x) => x.done).length,
    0,
  );
  const totalVolume = workout.exercises.reduce(
    (s, e) =>
      s + e.sets.filter((x) => x.done).reduce((v, x) => v + x.reps * x.weight, 0),
    0,
  );

  // Suggestions sorted with previously used names first (most recent first).
  const usedNames = Array.from(
    new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name))),
  );
  const suggestions = [
    ...usedNames,
    ...EXERCISE_SUGGESTIONS.filter((n) => !usedNames.includes(n)),
  ].slice(0, 12);

  return (
    <>
      <header
        className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-line"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <Link
            href="/workouts"
            aria-label="Back"
            className="h-9 w-9 -ml-2 rounded-full flex items-center justify-center text-ink-muted hover:bg-bg-hover"
          >
            <ArrowLeft size={18} />
          </Link>
          <button
            onClick={() => {
              setTitleDraft(workout.title);
              setRenaming(true);
            }}
            className="flex-1 min-w-0 text-left"
          >
            <h1 className="text-base font-semibold tracking-tight text-ink truncate">
              {workout.title}
            </h1>
            <p className="text-xs text-ink-muted truncate">
              {relativeLabel(workout.date)} · started {fmtTime(workout.startedAt)}
              {workout.endedAt ? ` · ended ${fmtTime(workout.endedAt)}` : ""}
            </p>
          </button>
          <button
            aria-label="Workout options"
            onClick={() => setMenuOpen(true)}
            className="h-9 w-9 -mr-2 rounded-full flex items-center justify-center text-ink-muted hover:bg-bg-hover"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      <main className="app-container pt-4 space-y-4">
        <Card>
          <CardBody className="grid grid-cols-3 gap-2 pt-4">
            <Stat label="Exercises" value={workout.exercises.length} />
            <Stat label="Sets done" value={totalDoneSets} />
            <Stat
              label="Volume"
              value={Math.round(totalVolume).toLocaleString()}
              unit={settings.unit}
            />
          </CardBody>
        </Card>

        <SectionLabel>Exercises</SectionLabel>

        {workout.exercises.length === 0 ? (
          <Empty
            title="No exercises yet"
            hint="Add your first exercise to start logging sets."
            action={
              <Button variant="primary" onClick={() => setAddOpen(true)}>
                <Plus size={16} /> Add exercise
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {workout.exercises.map((ex) => (
              <ExerciseBlock
                key={ex.id}
                workoutId={workout.id}
                exercise={ex}
                lastTime={selectExerciseHistory(workouts, ex.name, 1)[0]}
                unit={settings.unit}
              />
            ))}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={16} /> Add exercise
            </Button>
          </div>
        )}

        <CardioSection
          workoutId={workout.id}
          cardio={workout.cardio ?? []}
          unit={settings.unit}
        />

        {!workout.endedAt &&
          (workout.exercises.length > 0 ||
            (workout.cardio?.length ?? 0) > 0) && (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => endWorkout(workout.id)}
            >
              Finish workout
            </Button>
          )}
      </main>

      {/* Add-exercise modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add exercise">
        <div className="space-y-4">
          <Input
            autoFocus
            label="Exercise"
            placeholder="e.g. Bench Press"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add(exName)}
          />
          <div>
            <p className="text-2xs uppercase tracking-widest text-ink-dim mb-2">
              Quick pick
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => add(s)}
                  className="px-3 h-8 rounded-md bg-bg-elev border border-line text-xs text-ink hover:bg-bg-hover transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            disabled={!exName.trim()}
            onClick={() => add(exName)}
          >
            Add
          </Button>
        </div>
      </Modal>

      {/* Menu modal */}
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Options">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              setMenuOpen(false);
              setTitleDraft(workout.title);
              setRenaming(true);
            }}
          >
            Rename workout
          </Button>
          {!workout.endedAt && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                endWorkout(workout.id);
                setMenuOpen(false);
              }}
            >
              Mark as finished
            </Button>
          )}
          <Button
            variant="danger"
            className="w-full justify-start"
            onClick={() => {
              if (confirm("Delete this workout? This cannot be undone.")) {
                deleteWorkout(workout.id);
                router.push("/workouts");
              }
            }}
          >
            <Trash2 size={14} /> Delete workout
          </Button>
        </div>
      </Modal>

      {/* Rename modal */}
      <Modal open={renaming} onClose={() => setRenaming(false)} title="Rename workout">
        <div className="space-y-4">
          <Input
            autoFocus
            label="Workout name"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                renameWorkout(workout.id, titleDraft);
                setRenaming(false);
              }
            }}
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              renameWorkout(workout.id, titleDraft);
              setRenaming(false);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div>
      <p className="text-2xs uppercase tracking-widest text-ink-dim">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
        {value}
        {unit && (
          <span className="text-xs text-ink-muted ml-1 font-normal">{unit}</span>
        )}
      </p>
    </div>
  );
}
