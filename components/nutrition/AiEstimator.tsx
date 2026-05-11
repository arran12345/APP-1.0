"use client";

import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export interface FoodEstimate {
  name: string;
  calories: number;
  protein: number;
  note?: string;
}

interface Props {
  onEstimate: (e: FoodEstimate) => void;
}

/**
 * Plain-text → kcal/protein. Posts to /api/estimate-food which calls Claude
 * with a structured-output schema, so the returned JSON is always shaped right.
 *
 * UI degrades gracefully when the deployment has no ANTHROPIC_API_KEY:
 * the server returns 503 with a clear message and we render it inline.
 */
export function AiEstimator({ onEstimate }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function submit() {
    const prompt = text.trim();
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/estimate-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't estimate that.");
        return;
      }
      onEstimate({
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        note: data.note,
      });
      if (data.note) setNote(data.note);
      setText("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-accent/30 bg-accent/[0.06] p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles size={13} className="text-accent" />
        <span className="text-2xs uppercase tracking-widest text-ink-muted">
          AI estimate
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. 2 eggs and 50g oats, or large chicken Caesar wrap"
        rows={2}
        disabled={loading}
        className="w-full bg-bg-elev border border-line rounded-md text-sm text-ink placeholder:text-ink-dim px-3 py-2 outline-none resize-none focus:border-line-strong focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
      />
      {error && (
        <p className="text-2xs text-danger leading-tight" role="alert">
          {error}
        </p>
      )}
      {note && !error && (
        <p className="text-2xs text-ink-muted leading-tight">
          Filled below. Tweak if needed — {note}
        </p>
      )}
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        disabled={loading || !text.trim()}
        onClick={submit}
      >
        {loading ? "Estimating…" : "Estimate calories & protein"}
      </Button>
    </div>
  );
}
