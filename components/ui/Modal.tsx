"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full sm:max-w-md bg-bg-card border-t sm:border border-line sm:rounded-xl rounded-t-xl shadow-card animate-pop",
          "max-h-[92dvh] flex flex-col",
          className,
        )}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
            <h3 className="text-sm font-medium text-ink tracking-tight">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 -mr-1 rounded-full text-ink-muted hover:text-ink hover:bg-bg-hover flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-4 pb-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
