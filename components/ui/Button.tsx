import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:brightness-110 active:brightness-95 disabled:opacity-50",
  secondary:
    "bg-bg-elev text-ink border border-line hover:bg-bg-hover active:bg-bg-hover disabled:opacity-50",
  ghost:
    "bg-transparent text-ink hover:bg-bg-elev active:bg-bg-hover disabled:opacity-40",
  danger:
    "bg-transparent text-danger hover:bg-danger/10 active:bg-danger/15",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-5 text-sm rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "secondary", size = "md", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium select-none transition-[background,transform,opacity] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
});

// Icon-only round button — great for +/- in set rows.
export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { className, variant = "ghost", size = "md", ...rest },
  ref,
) {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors active:scale-95",
        variants[variant],
        dim,
        className,
      )}
      {...rest}
    />
  );
});
