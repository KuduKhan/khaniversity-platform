import { requireStudent } from "@/lib/database/server";
export async function studentState() {
  const { db, id, email } = await requireStudent();
  const [enrollment, progress, staff] = await Promise.all([
    db
      .from("enrollments")
      .select("course_id")
      .eq("user_id", id)
      .eq("course_id", "cs101")
      .maybeSingle(),
    db
      .from("lesson_progress")
      .select("lesson_id,completed,score,updated_at")
      .eq("user_id", id),
    db.from("course_staff").select("role").eq("user_id", id).limit(1),
  ]);
  if (enrollment.error || progress.error)
    throw new Error("Unable to load your learning record. Please retry.");
  return {
    email,
    isStaff: !!staff.data?.length,
    state: {
      enrolled: !!enrollment.data,
      completed:
        progress.data?.some(
          (entry) => entry.lesson_id === "computational-thinking" && entry.completed,
        ) ?? false,
      score:
        progress.data?.find((entry) => entry.lesson_id === "computational-thinking")?.score ?? null,
      moduleProgress: Object.fromEntries(
        (progress.data ?? [])
          .filter((entry) => entry.lesson_id !== "computational-thinking")
          .map((entry) => [
            entry.lesson_id,
            { score: entry.score, completedAt: entry.updated_at },
          ]),
      ),
    },
  };
}
