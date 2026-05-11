import { AppHeader } from "@/components/ui/BottomNav";
import { Hydrated } from "@/components/Hydrated";
import { NutritionScreen } from "@/components/nutrition/NutritionScreen";

export default function NutritionPage() {
  return (
    <>
      <AppHeader title="Food" subtitle="Calories & protein" />
      <main className="app-container pt-4 space-y-4">
        <Hydrated>
          <NutritionScreen />
        </Hydrated>
      </main>
    </>
  );
}
