import { AppHeader } from "@/components/ui/BottomNav";
import { Hydrated } from "@/components/Hydrated";
import { ProgressScreen } from "@/components/progress/ProgressScreen";

export default function ProgressPage() {
  return (
    <>
      <AppHeader title="Progress" subtitle="Body metrics & trends" />
      <main className="app-container pt-4 space-y-6">
        <Hydrated>
          <ProgressScreen />
        </Hydrated>
      </main>
    </>
  );
}
