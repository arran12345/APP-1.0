export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-10 px-6 border border-dashed border-line rounded-lg">
      <p className="text-sm text-ink">{title}</p>
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
