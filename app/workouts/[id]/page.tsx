import { Hydrated } from "@/components/Hydrated";
import { WorkoutDetail } from "@/components/workouts/WorkoutDetail";

export default function WorkoutDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Hydrated>
      <WorkoutDetail id={params.id} />
    </Hydrated>
  );
}
