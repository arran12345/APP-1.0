"use client";

import { cn } from "@/lib/utils";
import { Activity, Apple, Dumbbell, Home, LineChart, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/nutrition", label: "Food", icon: Apple },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/progress", label: "Progress", icon: LineChart },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg/80 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto max-w-md grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-2xs transition-colors relative",
                  active ? "text-ink" : "text-ink-dim hover:text-ink-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={cn(active && "text-accent")}
                />
                <span className="tracking-wide">{label}</span>
                {active && (
                  <span className="absolute top-0 h-px w-8 bg-accent rounded-full" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// AppHeader — slim top header used across screens.
export function AppHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-line"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-md px-4 py-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            {title}
          </h1>
          {subtitle ? (
            <div className="text-xs text-ink-muted mt-0.5 truncate">
              {subtitle}
            </div>
          ) : null}
        </div>
        {trailing}
      </div>
    </header>
  );
}
