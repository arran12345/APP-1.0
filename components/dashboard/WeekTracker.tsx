"use client";

import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Stat";
import { selectWeekStatus, useStore } from "@/lib/store";
import { dayNum, shortWeekday, todayKey } from "@/lib/date";
import { Check, Settings2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function WeekTracker() {
  const workouts = useStore((s) => s.workouts);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const status = selectWeekStatus(workouts, settings.weekStartsOn, settings.weeklyGoal);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(settings.weeklyGoal);
  const today = todayKey();

  return (
    <Card className="p-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs uppercase tracking-widest text-ink-dim">
            This week
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {status.completed}
            <span className="text-ink-muted text-base font-normal">
              {" "}/ {status.goal}
            </span>
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            {status.completed >= status.goal
              ? "Weekly goal hit. Nice."
              : `${status.goal - status.completed} session${status.goal - status.completed === 1 ? "" : "s"} to go`}
          </p>
        </div>
        <button
          aria-label="Edit weekly goal"
          onClick={() => {
            setDraft(settings.weeklyGoal);
            setEditing(true);
          }}
          className="h-8 w-8 -mr-1 -mt-1 rounded-full text-ink-muted hover:text-ink hover:bg-bg-hover flex items-center justify-center transition-colors"
        >
          <Settings2 size={15} />
        </button>
      </div>

      <ProgressBar value={status.pct} className="mt-3" />

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {status.days.map((d) => {
          const isToday = d.key === today;
          return (
            <li key={d.key} className="flex flex-col items-center gap-1.5">
              <span className="text-2xs text-ink-dim">
                {shortWeekday(d.key).slice(0, 1)}
              </span>
              <span
                className={[
                  "h-9 w-full rounded-md border flex items-center justify-center text-xs font-medium tabular-nums transition-colors",
                  d.isGym
                    ? "bg-accent text-accent-ink border-accent"
                    : "bg-bg-elev text-ink-muted border-line",
                  isToday && !d.isGym ? "ring-1 ring-accent/50" : "",
                ].join(" ")}
                aria-label={`${shortWeekday(d.key)} ${dayNum(d.key)}${d.isGym ? ", gym done" : ""}`}
              >
                {d.isGym ? <Check size={14} strokeWidth={3} /> : dayNum(d.key)}
              </span>
            </li>
          );
        })}
      </ul>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Weekly gym goal"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-muted">
            How many gym sessions do you want to hit per week?
          </p>
          <Input
            label="Sessions per week"
            type="number"
            inputMode="numeric"
            min={1}
            max={7}
            value={draft}
            onChange={(e) => setDraft(Number(e.target.value))}
          />
          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                updateSettings({
                  weeklyGoal: Math.max(1, Math.min(7, draft || 1)),
                });
                setEditing(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
