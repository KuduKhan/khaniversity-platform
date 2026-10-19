"use server";
import { requireStudent } from "@/lib/database/server";
import { grade } from "@/modules/assessments/grade";
import { course } from "@/modules/academics/catalog";
import { revalidatePath } from "next/cache";
export async function enroll() {
  const { db, id } = await requireStudent();
  const { error } = await db
    .from("enrollments")
    .upsert(
      { user_id: id, course_id: course.id },
      { onConflict: "user_id,course_id", ignoreDuplicates: true },
    );
  if (error)
    return { error: "Enrollment could not be saved. Please try again." };
  revalidatePath("/dashboard");
  return { ok: true };
}
export async function completeLesson(answers: unknown) {
  const { db } = await requireStudent();
  try {
    grade(answers);
  } catch {
    return { error: "Answer all five questions before submitting." };
  }
  // Database function checks ownership, enrollment, version and scoring itself.
  const { data, error } = await db.rpc("submit_foundation_check", { answers });
  if (error) return { error: "Your check could not be saved. Please retry." };
  revalidatePath("/dashboard");
  return { score: Number(data), passed: Number(data) >= 80 };
}

export async function completeModule(moduleId: string, answers: unknown) {
  const allowed = new Set([
    "programming-fundamentals",
    "variables-data-input-output",
    "conditions-loops",
    "functions-scope",
    "collections",
    "files-exceptions-debugging",
    "algorithms-complexity",
    "testing-git-quality",
    "personal-study-planner-capstone",
  ]);
  if (!allowed.has(moduleId) || !Array.isArray(answers) || answers.length !== 5 ||
      answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 2))
    return { error: "Complete all five questions with a valid answer." };
  const { db } = await requireStudent();
  const { data, error } = await db.rpc("submit_course_check", {
    p_module_id: moduleId,
    p_answers: answers,
  });
  if (error) return { error: "Your assessment could not be saved. Please retry." };
  revalidatePath("/dashboard");
  return { score: Number(data), passed: Number(data) >= 80 };
}

export async function saveCapstoneDraft(input: unknown) {
  if (input === null || typeof input !== "object")
    return { error: "Project draft is invalid." };
  const draft = input as Record<string, unknown>;
  if (
    typeof draft.title !== "string" ||
    !draft.title.trim() || draft.title.length > 100 ||
    typeof draft.code !== "string" || draft.code.length > 20000 ||
    typeof draft.reflection !== "string" || draft.reflection.length > 3000
  ) return { error: "Check the project title, code and reflection length." };
  const { db, id } = await requireStudent();
  const { error } = await db.from("project_drafts").upsert({
    user_id: id,
    course_id: "cs101",
    title: draft.title.trim(),
    source_code: draft.code,
    reflection: draft.reflection,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,course_id" });
  if (error) return { error: "Your private project draft could not be saved." };
  revalidatePath("/dashboard");
  return { ok: true };
}
