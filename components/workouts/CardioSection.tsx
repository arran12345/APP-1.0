"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Card, SectionLabel } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import type { CardioEntry, Unit } from "@/lib/types";
import { Footprints, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  workoutId: string;
  cardio: CardioEntry[];
  unit: Unit;
}

const CARDIO_TYPES = [
  "Running",
  "Cycling",
  "Rowing",
  "Walking",
  "Stairmaster",
  "Elliptical",
  "Swimming",
  "HIIT",
  "Jump rope",
  "Hiking",
] as const;

export function CardioSection({ workoutId, cardio, unit }: Props) {
  const addCardio = useStore((s) => s.addCardio);
  const updateCardio = useStore((s) => s.updateCardio);
  const removeCardio = useStore((s) => s.removeCardio);
  const workouts = useStore((s) => s.workouts);

  const distanceUnit = unit === "kg" ? "km" : "mi";

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");

  // Suggest previously-used cardio types first, common ones after.
  const previousTypes = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const w of workouts) {
      for (const c of w.cardio ?? []) {
        const t = c.type.trim();
        if (!t || seen.has(t)) continue;
        seen.add(t);
        ordered.push(t);
      }
    }
    return ordered;
  }, [workouts]);

  const suggestions = [
    ...previousTypes,
    ...CARDIO_TYPES.filter((t) => !previousTypes.includes(t)),
  ].slice(0, 12);

  function openCreate() {
    setEditingId(null);
    setType("");
    setDuration("");
    setDistance("");
    setOpen(true);
  }

  function openEdit(c: CardioEntry) {
    setEditingId(c.id);
    setType(c.type);
    setDuration(String(c.duration));
    setDistance(c.distance != null ? String(c.distance) : "");
    setOpen(true);
  }

  function submit() {
    const t = type.trim();
    const d = Number(duration);
    if (!t || !Number.isFinite(d) || d <= 0) return;
    const dist = distance.trim() === "" ? undefined : Number(distance);
    const entry = {
      type: t,
      duration: Math.max(1, Math.round(d)),
      distance:
        dist !== undefined && Number.isFinite(dist) && dist >= 0
          ? +dist.toFixed(2)
          : undefined,
    };
    if (editingId) {
      updateCardio(workoutId, editingId, entry);
    } else {
      addCardio(workoutId, entry);
    }
    setOpen(false);
  }

  return (
    <section className="space-y-2">
      <SectionLabel>Cardio</SectionLabel>

      {cardio.length === 0 ? (
        <button
          type="button"
          onClick={openCreate}
          className="w-full h-12 rounded-lg border border-dashed border-line text-sm text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors flex items-center justify-center gap-2"
        >
          <Footprints size={14} />
          Add cardio
        </button>
      ) : (
        <>
          <Card className="divide-y divide-line overflow-hidden">
            {cardio.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm text-ink truncate">{c.type}</p>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {c.duration} min
                    {c.distance != null && c.distance > 0
                      ? ` · ${c.distance} ${distanceUnit}`
                      : ""}
                  </p>
                </button>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${c.type}`}
                  onClick={() => removeCardio(workoutId, c.id)}
                >
                  <Trash2 size={14} className="text-ink-dim" />
                </IconButton>
              </div>
            ))}
          </Card>
          <Button
            variant="secondary"
            className="w-full"
            onClick={openCreate}
          >
            <Plus size={16} /> Add cardio
          </Button>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit cardio" : "Add cardio"}
      >
        <div className="space-y-3">
          <Input
            label="Type"
            placeholder="e.g. Running"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <div>
            <p className="text-2xs uppercase tracking-widest text-ink-dim mb-2">
              Quick pick
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setType(s)}
                  className={[
                    "px-3 h-8 rounded-md text-xs transition-colors border",
                    s === type.trim()
                      ? "bg-accent text-accent-ink border-accent"
                      : "bg-bg-elev text-ink border-line hover:bg-bg-hover",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              trailing="min"
            />
            <Input
              label="Distance"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              placeholder="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              trailing={distanceUnit}
            />
          </div>
          <p className="text-2xs text-ink-dim">
            Leave distance empty for non-distance cardio (HIIT, stairmaster…).
          </p>
          <Button
            variant="primary"
            className="w-full mt-1"
            disabled={!type.trim() || !duration || Number(duration) <= 0}
            onClick={submit}
          >
            {editingId ? "Save" : "Add"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
