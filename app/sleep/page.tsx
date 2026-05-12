import { AppHeader } from "@/components/ui/BottomNav";
import { Hydrated } from "@/components/Hydrated";
import { SleepScreen } from "@/components/sleep/SleepScreen";

export default function SleepPage() {
  return (
    <>
      <AppHeader title="Sleep" subtitle="Duration & quality" />
      <main className="app-container pt-4 space-y-4">
        <Hydrated>
          <SleepScreen />
        </Hydrated>
      </main>
    </>
  );
}
