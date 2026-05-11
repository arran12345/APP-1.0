"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/Stat";
import { selectFoodForDay, useStore } from "@/lib/store";
import { todayKey } from "@/lib/date";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function NutritionScreen() {
  const food = useStore((s) => s.food);
  const logFood = useStore((s) => s.logFood);
  const removeFood = useStore((s) => s.removeFood);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const day = selectFoodForDay(food, todayKey());

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [pro, setPro] = useState("");

  const [editingTargets, setEditingTargets] = useState(false);
  const [calTarget, setCalTarget] = useState(settings.calorieTarget);
  const [proTarget, setProTarget] = useState(settings.proteinTarget);

  function submit() {
    const c = Number(cal) || 0;
    const p = Number(pro) || 0;
    if (!name.trim() && c === 0 && p === 0) return;
    logFood({
      date: todayKey(),
      name: name.trim() || "Food",
      calories: c,
      protein: p,
    });
    setName("");
    setCal("");
    setPro("");
    setOpen(false);
  }

  const calPct = settings.calorieTarget
    ? day.calories / settings.calorieTarget
    : 0;
  const proPct = settings.proteinTarget
    ? day.protein / settings.proteinTarget
    : 0;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-2xs uppercase tracking-widest text-ink-dim">
            Today
          </p>
          <button
            onClick={() => {
              setCalTarget(settings.calorieTarget);
              setProTarget(settings.proteinTarget);
              setEditingTargets(true);
            }}
            className="text-2xs text-ink-muted hover:text-ink"
          >
            Edit targets
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <Macro
            label="Calories"
            value={day.calories}
            target={settings.calorieTarget}
            pct={calPct}
            unit="kcal"
          />
          <Macro
            label="Protein"
            value={Math.round(day.protein)}
            target={settings.proteinTarget}
            pct={proPct}
            unit="g"
          />
        </div>
      </Card>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} strokeWidth={2.5} /> Log food
      </Button>

      <SectionLabel>Today's log</SectionLabel>

      {day.items.length === 0 ? (
        <Empty
          title="Nothing logged today"
          hint="Add a quick entry — name, calories, protein. That's it."
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {day.items.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{f.name}</p>
                <p className="text-xs text-ink-muted tabular-nums">
                  {f.calories} kcal · {f.protein}g protein
                </p>
              </div>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Remove ${f.name}`}
                onClick={() => removeFood(f.id)}
              >
                <Trash2 size={14} className="text-ink-dim" />
              </IconButton>
            </div>
          ))}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Log food">
        <div className="space-y-3">
          <Input
            autoFocus
            label="Name"
            placeholder="e.g. Chicken & rice"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={cal}
              onChange={(e) => setCal(e.target.value)}
              trailing="kcal"
            />
            <Input
              label="Protein"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={pro}
              onChange={(e) => setPro(e.target.value)}
              trailing="g"
            />
          </div>
          <Button variant="primary" className="w-full mt-1" onClick={submit}>
            Save
          </Button>
        </div>
      </Modal>

      <Modal
        open={editingTargets}
        onClose={() => setEditingTargets(false)}
        title="Daily targets"
      >
        <div className="space-y-3">
          <Input
            label="Calorie target"
            type="number"
            inputMode="numeric"
            value={calTarget}
            onChange={(e) => setCalTarget(Number(e.target.value))}
            trailing="kcal"
          />
          <Input
            label="Protein target"
            type="number"
            inputMode="numeric"
            value={proTarget}
            onChange={(e) => setProTarget(Number(e.target.value))}
            trailing="g"
          />
          <Button
            variant="primary"
            className="w-full mt-1"
            onClick={() => {
              updateSettings({
                calorieTarget: Math.max(0, calTarget || 0),
                proteinTarget: Math.max(0, proTarget || 0),
              });
              setEditingTargets(false);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Macro({
  label,
  value,
  target,
  pct,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  pct: number;
  unit: string;
}) {
  const remaining = Math.max(0, target - value);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-ink-muted">{label}</span>
        <span className="text-sm tabular-nums">
          <span className="text-ink font-medium">{value}</span>
          <span className="text-ink-dim"> / {target} {unit}</span>
        </span>
      </div>
      <ProgressBar value={pct} className="mt-1.5" />
      <p className="mt-1 text-2xs text-ink-dim tabular-nums">
        {pct >= 1
          ? `+${value - target} over`
          : `${remaining} ${unit} left`}
      </p>
    </div>
  );
}
