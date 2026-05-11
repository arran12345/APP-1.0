"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { fromKey, todayKey, toKey } from "@/lib/date";
import { type DateKey } from "@/lib/types";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  date: DateKey;
  onChange: (date: DateKey) => void;
}

/**
 * Day selector: arrows step ±1 day, tap the label for a date picker. Forward
 * arrow is disabled at today (future-day logging would be confusing).
 */
export function DateNav({ date, onChange }: Props) {
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState(date);
  const today = todayKey();
  const isToday = date === today;
  const isFuture = date > today;

  function step(delta: number) {
    const next = toKey(addDays(fromKey(date), delta));
    if (next > today) return;
    onChange(next);
  }

  return (
    <Card className="px-2 py-1.5 flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => step(-1)}
        className="h-9 w-9 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() => {
          setDraft(date);
          setPicking(true);
        }}
        className="flex-1 h-9 px-2 rounded-md flex items-center justify-center gap-2 text-ink hover:bg-bg-hover transition-colors"
      >
        <Calendar size={13} className="text-ink-dim" />
        <span className="text-sm font-medium tracking-tight">
          {labelFor(date)}
        </span>
      </button>

      <button
        type="button"
        aria-label="Next day"
        onClick={() => step(1)}
        disabled={isToday || isFuture}
        className="h-9 w-9 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronRight size={18} />
      </button>

      <Modal open={picking} onClose={() => setPicking(false)} title="Pick a day">
        <div className="space-y-3">
          <Input
            autoFocus
            label="Date"
            type="date"
            max={today}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setPicking(false);
              }}
              className="flex-1 h-10 rounded-md bg-bg-elev border border-line text-sm text-ink hover:bg-bg-hover transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                if (!draft || draft > today) return;
                onChange(draft);
                setPicking(false);
              }}
              className="flex-1 h-10 rounded-md bg-accent text-accent-ink text-sm font-medium hover:brightness-95 transition"
            >
              Go to date
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function labelFor(key: DateKey): string {
  const diff = differenceInCalendarDays(new Date(), fromKey(key));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) {
    return `${format(fromKey(key), "EEE")} · ${diff}d ago`;
  }
  return format(fromKey(key), "EEE, MMM d");
}
