import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Short, URL-safe, collision-resistant-enough for client-local IDs.
export function uid(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
