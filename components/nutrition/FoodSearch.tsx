"use client";

import { type FoodItem, searchFoods } from "@/lib/food-db";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  onPick: (food: FoodItem) => void;
}

/**
 * Search-and-tap food picker. Type 2+ chars, see common matches, tap to
 * fill the form below. Works offline (DB is a local module).
 */
export function FoodSearch({ onPick }: Props) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.length >= 2 ? searchFoods(q, 8) : []), [q]);

  return (
    <div className="space-y-2">
      <div className="flex items-center bg-bg-elev border border-line rounded-md focus-within:border-line-strong focus-within:ring-2 focus-within:ring-accent/20 transition-colors">
        <Search size={14} className="text-ink-dim ml-3 shrink-0" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search food (chicken, oats, banana…)"
          className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-dim h-10 px-2 outline-none"
          aria-label="Search food database"
        />
      </div>

      {q.length >= 2 && (
        <div
          className="max-h-56 overflow-y-auto rounded-md border border-line bg-bg-elev divide-y divide-line"
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-ink-dim">
              No matches. Type the numbers in manually below.
            </p>
          ) : (
            results.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => {
                  onPick(f);
                  setQ("");
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-bg-hover text-left transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{f.name}</p>
                  <p className="text-2xs text-ink-dim truncate">{f.serving}</p>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  <p className="text-xs text-ink">{f.kcal} kcal</p>
                  <p className="text-2xs text-ink-muted">{f.protein}g protein</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
