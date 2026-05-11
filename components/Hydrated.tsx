"use client";

import { useEffect, useState } from "react";

/**
 * Renders children only after client hydration. We use this around store-backed
 * trees because zustand/persist rehydrates from localStorage, which can't run
 * during SSR. Without this guard, server-rendered "empty" state briefly flashes
 * before the real data appears.
 */
export function Hydrated({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <>{ready ? children : fallback}</>;
}
