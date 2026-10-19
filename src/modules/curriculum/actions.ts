"use server";

import { revalidatePath } from "next/cache";
import { requireCourseStaff } from "@/lib/database/server";
import { getCourseModule } from "@/modules/academics/curriculum";

export async function proposeLessonMaterial(input: { lessonId: string; title: string; body: string }) {
  const lesson = typeof input?.lessonId === "string" ? getCourseModule(input.lessonId) : null;
  if (!lesson || typeof input.title !== "string" || typeof input.body !== "string" ||
      input.title.trim().length < 5 || input.title.length > 120 ||
      input.body.trim().length < 80 || input.body.length > 8000)
    return { error: "Choose a valid CS101 lesson, a clear title and 80–8,000 characters of original learning material." };
  const { db, id } = await requireCourseStaff("cs101", ["instructor", "administrator"]);
  const { data: existing, error: existingError } = await db.from("lessons")
    .select("id,content_version").eq("id", input.lessonId).eq("published", true)
    .order("content_version", { ascending: false }).limit(1).maybeSingle();
  if (existingError || !existing) return { error: "This lesson has no published academic base version." };
  const { error } = await db.from("lesson_revisions").insert({
    course_id: "cs101", lesson_id: existing.id, base_content_version: existing.content_version,
    title: input.title.trim(), body: input.body.trim(), author_id: id,
  });
  if (error) return { error: "Proposal was not saved. Confirm your instructor assignment." };
  revalidatePath("/admin");
  return { ok: true };
}

export async function reviewLessonMaterial(input: { id: number; approve: boolean; note: string }) {
  if (!Number.isSafeInteger(input?.id) || input.id < 1 || typeof input.approve !== "boolean" ||
      typeof input.note !== "string" || input.note.length > 1500)
    return { error: "Choose a valid review and keep notes below 1,500 characters." };
  const { db } = await requireCourseStaff("cs101", ["reviewer", "administrator"]);
  const { error } = await db.rpc("review_lesson_revision", {
    p_id: input.id, p_approve: input.approve, p_note: input.note.trim(),
  });
  if (error) return { error: "Review rejected. A separate reviewer is required; this proposal may already be reviewed." };
  revalidatePath("/admin");
  revalidatePath("/learn/cs101");
  return { ok: true };
}
