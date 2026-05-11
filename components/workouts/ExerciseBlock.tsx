"use client";

import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/Input";
import { useStore, type ExerciseHistoryRow } from "@/lib/store";
import type { Exercise, Unit } from "@/lib/types";
import { Check, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { relativeLabel } from "@/lib/date";

interface Props {
  workoutId: string;
  exercise: Exercise;
  lastTime?: ExerciseHistoryRow;
  unit: Unit;
}

export function ExerciseBlock({ workoutId, exercise, lastTime, unit }: Props) {
  const addSet = useStore((s) => s.addSet);
  const updateSet = useStore((s) => s.updateSet);
  const toggleSet = useStore((s) => s.toggleSet);
  const removeSet = useStore((s) => s.removeSet);
  const removeExercise = useStore((s) => s.removeExercise);
  const renameExercise = useStore((s) => s.renameExercise);
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(exercise.name);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button
            onClick={() => {
              setDraftName(exercise.name);
              setRenaming(true);
            }}
            className="text-left"
          >
            <h3 className="text-sm font-medium text-ink truncate">
              {exercise.name}
            </h3>
          </button>
          {lastTime ? (
            <p className="text-2xs text-ink-dim mt-0.5 tabular-nums">
              Last · {relativeLabel(lastTime.date)} ·{" "}
              <span className="text-ink-muted">
                {lastTime.topSet.weight}
                {unit} × {lastTime.topSet.reps}
              </span>
            </p>
          ) : (
            <p className="text-2xs text-ink-dim mt-0.5">No prior data</p>
          )}
        </div>
        <button
          aria-label="Exercise options"
          onClick={() => setMenu(true)}
          className="h-8 w-8 -mr-1 rounded-full text-ink-muted hover:text-ink hover:bg-bg-hover flex items-center justify-center"
        >
          <MoreVertical size={15} />
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <div className="px-4 pb-1 grid grid-cols-[1.5rem_1fr_1fr_2.25rem] items-center gap-2 text-2xs uppercase tracking-widest text-ink-dim">
          <span>#</span>
          <span>Weight</span>
          <span>Reps</span>
          <span />
        </div>
      )}

      <ul className="px-2 pb-2">
        {exercise.sets.map((set, idx) => (
          <li
            key={set.id}
            className={[
              "grid grid-cols-[1.5rem_1fr_1fr_2.25rem] items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
              set.done ? "bg-accent/[0.06]" : "hover:bg-bg-hover",
            ].join(" ")}
          >
            <span className="text-xs text-ink-dim tabular-nums">{idx + 1}</span>
            <NumberStepper
              ariaLabel="weight"
              value={set.weight}
              onChange={(n) =>
                updateSet(workoutId, exercise.id, set.id, { weight: n })
              }
              step={2.5}
              suffix={unit}
            />
            <NumberStepper
              ariaLabel="reps"
              value={set.reps}
              onChange={(n) =>
                updateSet(workoutId, exercise.id, set.id, { reps: n })
              }
              step={1}
              max={100}
            />
            <button
              aria-label={set.done ? "Mark incomplete" : "Mark complete"}
              onClick={() => toggleSet(workoutId, exercise.id, set.id)}
              className={[
                "h-9 w-9 rounded-md flex items-center justify-center transition-colors",
                set.done
                  ? "bg-accent text-accent-ink"
                  : "bg-bg-elev border border-line text-ink-muted hover:text-ink hover:bg-bg-hover",
              ].join(" ")}
            >
              <Check size={14} strokeWidth={3} />
            </button>
          </li>
        ))}
      </ul>

      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => addSet(workoutId, exercise.id)}
          className="flex-1 h-9 rounded-md border border-dashed border-line text-xs text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> Add set
        </button>
        {exercise.sets.length > 0 && (
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Remove last set"
            onClick={() =>
              removeSet(
                workoutId,
                exercise.id,
                exercise.sets[exercise.sets.length - 1].id,
              )
            }
          >
            <Trash2 size={13} className="text-ink-dim" />
          </IconButton>
        )}
      </div>

      <Modal open={menu} onClose={() => setMenu(false)} title={exercise.name}>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              setMenu(false);
              setDraftName(exercise.name);
              setRenaming(true);
            }}
          >
            Rename
          </Button>
          <Button
            variant="danger"
            className="w-full justify-start"
            onClick={() => {
              removeExercise(workoutId, exercise.id);
              setMenu(false);
            }}
          >
            <Trash2 size={14} /> Remove exercise
          </Button>
        </div>
      </Modal>

      <Modal
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Rename exercise"
      >
        <div className="space-y-4">
          <Input
            autoFocus
            label="Exercise"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                renameExercise(workoutId, exercise.id, draftName);
                setRenaming(false);
              }
            }}
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              renameExercise(workoutId, exercise.id, draftName);
              setRenaming(false);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
