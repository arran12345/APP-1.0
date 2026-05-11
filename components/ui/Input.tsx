import { cn } from "@/lib/utils";
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
  return (
    <div className="inline-flex items-center bg-bg-elev border border-line rounded-md h-9 overflow-hidden">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel ?? ""}`.trim()}
        onClick={() => onChange(clamp(value - step))}
        className="h-full w-8 text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors"
      >
        −
      </button>
      <div className="px-2 min-w-[3.5rem] text-center">
        <input
          inputMode="decimal"
          aria-label={ariaLabel}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number(e.target.value.replace(",", "."));
            onChange(Number.isFinite(n) ? clamp(n) : min);
          }}
          className="w-full bg-transparent text-sm text-ink text-center font-mono tabular-nums outline-none"
        />
        {suffix && (
          <span className="ml-0.5 text-2xs text-ink-dim">{suffix}</span>
        )}
      </div>
      <button
        type="button"
        aria-label={`Increase ${ariaLabel ?? ""}`.trim()}
        onClick={() => onChange(clamp(value + step))}
        className="h-full w-8 text-ink-muted hover:text-ink hover:bg-bg-hover transition-colors"
      >
        +
      </button>
    </div>
  );
}
