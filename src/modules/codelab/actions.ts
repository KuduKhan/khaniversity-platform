"use server";

import { revalidatePath } from "next/cache";
import { requireCourseStaff, requireStudent } from "@/lib/database/server";

export type SavedCodeSubmission = {
  id: string;
  source_code: string;
  status: "submitted" | "reviewed" | "needs-work";
  code_tests_passed: boolean;
  feedback: string;
  submitted_at: string;
};

export async function submitCodeSolution(source: unknown) {
  if (typeof source !== "string" || source.trim().length < 10 || source.length > 6000)
    return { error: "Write at least 10 characters and keep the solution under 6,000 characters." };
  const { db, id } = await requireStudent();
  const { data: membership, error: membershipError } = await db.from("enrollments")
    .select("course_id").eq("user_id", id).eq("course_id", "cs101").maybeSingle();
  if (membershipError || !membership) return { error: "Enroll in CS101 to submit code." };
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count, error: countError } = await db.from("code_submissions")
    .select("id", { head: true, count: "exact" }).eq("user_id", id).gte("submitted_at", dayAgo);
  if (countError) return { error: "Could not verify your submission quota. Retry shortly." };
  if ((count ?? 0) >= 20) return { error: "You have reached 20 submissions today. Please try tomorrow." };
  const { data, error } = await db.from("code_submissions").insert({
    user_id: id, course_id: "cs101", exercise_id: "total-minutes", source_code: source,
  }).select("id,source_code,status,code_tests_passed,feedback,submitted_at").single();
  if (error || !data) return { error: "Your code could not be submitted. Retry or contact the academy." };
  revalidatePath("/codelab");
  revalidatePath("/admin");
  return { submission: data as SavedCodeSubmission };
}

export async function reviewCodeSubmission(input: { id: string; passed: boolean; feedback: string; confirmed: boolean }) {
  if (!/^[\da-f-]{36}$/i.test(input.id) || typeof input.passed !== "boolean" ||
      typeof input.feedback !== "string" || input.feedback.length > 1500 ||
      (input.passed && !input.confirmed))
    return { error: "Check the decision, feedback and test-verification acknowledgment." };
  const { db } = await requireCourseStaff("cs101");
  const { error } = await db.rpc("review_code_submission", {
    p_id: input.id, p_passed: input.passed, p_note: input.feedback.trim(),
  });
  if (error) return { error: "The review could not be saved. Check reviewer access and submission status." };
  revalidatePath("/admin");
  revalidatePath("/codelab");
  return { ok: true };
}
