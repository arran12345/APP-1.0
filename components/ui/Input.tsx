import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useState,
  type InputHTMLAttributes,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, trailing, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="block text-2xs uppercase tracking-widest text-ink-dim mb-1.5">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex items-center bg-bg-elev border border-line rounded-md focus-within:border-line-strong focus-within:ring-2 focus-within:ring-accent/20 transition-colors",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-dim h-10 px-3 outline-none"
          {...rest}
        />
        {trailing && (
          <span className="pr-3 text-xs text-ink-muted shrink-0">{trailing}</span>
        )}
      </div>
    </label>
  );
});

// NumberStepper — a compact numeric field with +/- for set rows.
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  suffix,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  ariaLabel?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  // Draft state — keep what the user is typing as a string so intermediate
  // forms like "7." don't get parsed-and-stripped back to 7 mid-keystroke.
  // We commit a parsed number on every valid edit and re-sync the draft when
  // `value` changes from outside (e.g. when the user taps + / −).
  const valueStr = String(Number.isFinite(value) ? value : 0);
  const [draft, setDraft] = useState(valueStr);
  useEffect(() => {
    setDraft(valueStr);
  }, [valueStr]);

  // ch-based width with a generous buffer. tabular-nums + monospace make `ch`
  // ≈ one digit width, but rendering on Android can shave a sub-pixel off the
  // right edge — the previous +0.25ch buffer was clipping the last digit on
  // some devices, so we use +0.9ch and a 2ch minimum.
  const inputWidth = `${Math.max(2, draft.length) + 0.9}ch`;

  function handleChange(raw: string) {
    // Accept digits, an optional decimal separator, and partial states like
    // "" / "." / "7." while typing. Anything else is ignored.
    if (!/^\d*[.,]?\d*$/.test(raw)) return;
    setDraft(raw);
    if (raw === "" || raw === "." || raw === ",") return;
    const n = Number(raw.replace(",", "."));
    if (Number.isFinite(n)) onChange(clamp(n));
  }

  function handleBlur() {
    // Empty / lone-decimal field on blur reverts to the last good value.
    if (draft === "" || draft === "." || draft === ",") {
      setDraft(valueStr);
      return;
    }
    const n = Number(draft.replace(",", "."));
    if (!Number.isFinite(n)) {
      setDraft(valueStr);
      return;
    }
    const clamped = clamp(n);
    if (clamped !== n) {
      onChange(clamped);
      setDraft(String(clamped));
    }
  }

  return (
    <div className="inline-flex w-full items-center bg-bg-elev border border-line rounded-md h-9 overflow-hidden">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel ?? ""}`.trim()}
        onClick={() => onChange(clamp(value - step))}
        className="h-full w-8 shrink-0 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <div className="flex-1 min-w-0 h-full flex items-center justify-center gap-1.5 px-1">
        <input
          inputMode="decimal"
          aria-label={ariaLabel}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          style={{ width: inputWidth }}
          // shrink-0 stops flex from squeezing the input below its
          // requested width on narrow columns (the previous max-w-full
          // class capped the input to its parent and clipped digits).
          className="shrink-0 bg-transparent text-sm text-ink text-right font-mono tabular-nums outline-none p-0 leading-none"
        />
        {suffix && (
          <span className="text-2xs text-ink-dim shrink-0 leading-none">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label={`Increase ${ariaLabel ?? ""}`.trim()}
        onClick={() => onChange(clamp(value + step))}
        className="h-full w-8 shrink-0 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
