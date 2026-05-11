import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-bg-card border border-line rounded-lg shadow-card",
          className,
        )}
        {...rest}
      />
    );
  },
);

export function CardHeader({
  title,
  subtitle,
  trailing,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-4 pt-4 pb-2",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-ink tracking-tight">{title}</h2>
        {subtitle ? (
          <div className="text-xs text-ink-muted mt-0.5 truncate">
            {subtitle}
          </div>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

export function CardBody({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4 pt-1", className)} {...rest} />;
}

// SectionLabel — small uppercase eyebrow used outside cards.
export function SectionLabel({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <span className="text-2xs uppercase tracking-widest text-ink-dim">
        {children}
      </span>
      {trailing}
    </div>
  );
}
