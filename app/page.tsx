import { AppHeader } from "@/components/ui/BottomNav";
import { Hydrated } from "@/components/Hydrated";
import { WeekTracker } from "@/components/dashboard/WeekTracker";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { StartWorkoutButton } from "@/components/dashboard/StartWorkout";
import { Greeting } from "@/components/dashboard/Greeting";

export default function HomePage() {
  return (
    <>
      <AppHeader title="Pulse" subtitle={<Greeting />} />
      <main className="app-container pt-4 space-y-6">
        <Hydrated fallback={<DashboardSkeleton />}>
          <WeekTracker />
          <QuickStats />
          <StartWorkoutButton className="w-full" />
          <RecentWorkouts />
        </Hydrated>
      </main>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-44 rounded-lg bg-bg-card border border-line animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-lg bg-bg-card border border-line animate-pulse" />
        <div className="h-24 rounded-lg bg-bg-card border border-line animate-pulse" />
        <div className="h-24 rounded-lg bg-bg-card border border-line animate-pulse col-span-2" />
      </div>
    </div>
  );
}
