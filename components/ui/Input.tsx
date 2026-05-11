import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { type InputHTMLAttributes, forwardRef } from "react";

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
  // Auto-size the input to fit its current value. Using `ch` with tabular-nums
  // means 1ch ≈ width of one digit, so the input is exactly as wide as the
  // number it shows — no trailing dead space, and the unit ("kg") sits right
  // next to the digit with a deliberate 6px gap.
  const display = String(Number.isFinite(value) ? value : 0);
  const inputWidth = `${Math.max(1, display.length) + 0.25}ch`;
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
          value={display}
          onChange={(e) => {
            const n = Number(e.target.value.replace(",", "."));
            onChange(Number.isFinite(n) ? clamp(n) : min);
          }}
          style={{ width: inputWidth }}
          className="min-w-0 max-w-full bg-transparent text-sm text-ink text-right font-mono tabular-nums outline-none p-0 leading-none"
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
