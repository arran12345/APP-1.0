"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body"];

export function StartWorkoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const startWorkout = useStore((s) => s.startWorkout);
  const router = useRouter();

  function start(name: string) {
    const id = startWorkout(name);
    setOpen(false);
    setTitle("");
    router.push(`/workouts/${id}`);
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus size={16} strokeWidth={2.5} />
        Start workout
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="New workout">
        <div className="space-y-4">
          <Input
            autoFocus
            label="Workout name"
            placeholder="e.g. Push Day"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) start(title);
            }}
          />
          <div>
            <p className="text-2xs uppercase tracking-widest text-ink-dim mb-2">
              Quick pick
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => start(s)}
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
            disabled={!title.trim()}
            onClick={() => start(title)}
          >
            Start
          </Button>
        </div>
      </Modal>
    </>
  );
}
