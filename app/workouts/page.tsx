import { AppHeader } from "@/components/ui/BottomNav";
import { Hydrated } from "@/components/Hydrated";
import { StartWorkoutButton } from "@/components/dashboard/StartWorkout";
import { WorkoutList } from "@/components/workouts/WorkoutList";

export default function WorkoutsPage() {
  return (
    <>
      <AppHeader title="Workouts" subtitle="History & active sessions" />
      <main className="app-container pt-4 space-y-4">
        <StartWorkoutButton className="w-full" />
        <Hydrated>
          <WorkoutList />
        </Hydrated>
      </main>
    </>
  );
}
