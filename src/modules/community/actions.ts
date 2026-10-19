"use server";
import { revalidatePath } from "next/cache";
import { requireCourseStaff, requireStudent } from "@/lib/database/server";

export async function saveLearnerProfile(input: unknown) {
  if (!input || typeof input !== "object") return { error: "Profile details are invalid." };
  const value = input as Record<string, unknown>;
  if (typeof value.name !== "string" || value.name.trim().length < 2 || value.name.length > 60)
    return { error: "Choose a display name from 2 to 60 characters." };
  const { db, id } = await requireStudent();
  const { error } = await db.from("profiles").upsert({
    user_id: id,
    display_name: value.name.trim(),
    peer_visible: value.peerVisible === true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) return { error: "Your profile could not be saved." };
  revalidatePath("/community");
  return { ok: true };
}

export async function joinCohort(input: unknown) {
  if (typeof input !== "string" || input.trim().length < 8 || input.length > 80)
    return { error: "Enter a valid cohort invitation code." };
  const { db } = await requireStudent();
  const { data, error } = await db.rpc("join_course_cohort", { p_invite_code: input.trim() });
  if (error) return { error: "We could not join that cohort. Check the invitation and your course enrollment." };
  revalidatePath("/community");
  return { cohortId: String(data) };
}

export async function createCohort(input: unknown) {
  if (!input || typeof input !== "object") return { error: "Cohort details are invalid." };
  const { title, courseId } = input as Record<string, unknown>;
  if (typeof title !== "string" || title.trim().length < 3 || title.length > 100 || typeof courseId !== "string")
    return { error: "Enter a course and a cohort name from 3 to 100 characters." };
  const { db } = await requireCourseStaff(courseId, ["instructor", "administrator"]);
  const { data, error } = await db.rpc("create_course_cohort", {
    p_course_id: courseId,
    p_title: title.trim(),
  });
  if (error) return { error: "The cohort could not be created." };
  revalidatePath("/admin");
  revalidatePath("/community");
  return { cohortId: String(data) };
}

export async function postToCohort(input: unknown) {
  if (!input || typeof input !== "object") return { error: "Post details are invalid." };
  const value = input as Record<string, unknown>;
  if (typeof value.cohortId !== "string" || typeof value.body !== "string" || !value.body.trim() || value.body.length > 5000)
    return { error: "Write a message of up to 5,000 characters." };
  if (value.parentId !== undefined && value.parentId !== null && !Number.isInteger(value.parentId))
    return { error: "Reply target is invalid." };
  const { db, id } = await requireStudent();
  const { error } = await db.from("cohort_posts").insert({
    cohort_id: value.cohortId,
    user_id: id,
    parent_id: value.parentId ?? null,
    post_type: value.projectUpdate === true ? "project-update" : "discussion",
    body: value.body.trim(),
  });
  if (error) return { error: "This post could not be shared. Confirm you are in the cohort." };
  revalidatePath("/community");
  return { ok: true };
}

export async function shareCapstone(input: unknown) {
  if (!input || typeof input !== "object") return { error: "Project share details are invalid." };
  const value = input as Record<string, unknown>;
  if (typeof value.cohortId !== "string" || typeof value.summary !== "string" || value.summary.trim().length < 20 || value.summary.length > 3000)
    return { error: "Add a project summary of 20 to 3,000 characters." };
  const { db, id } = await requireStudent();
  const [{ data: draft }, { data: profile }] = await Promise.all([
    db.from("project_drafts").select("title,source_code").eq("course_id", "cs101").maybeSingle(),
    db.from("profiles").select("display_name").eq("user_id", id).maybeSingle(),
  ]);
  if (!draft) return { error: "Save your Personal Study Planner draft before sharing." };
  if (!profile?.display_name) return { error: "Set a learner display name before sharing a project." };
  const { error } = await db.from("project_submissions").insert({
    user_id: id,
    course_id: "cs101",
    cohort_id: value.cohortId,
    title: draft.title,
    summary: value.summary.trim(),
    source_code: draft.source_code,
  });
  if (error) return { error: "Project sharing failed. Check cohort membership and enrollment." };
  revalidatePath("/community");
  return { ok: true };
}

export async function reviewPeerProject(input: unknown) {
  if (!input || typeof input !== "object") return { error: "Review details are invalid." };
  const value = input as Record<string, unknown>;
  if (typeof value.submissionId !== "string" || typeof value.feedback !== "string" || value.feedback.trim().length < 20 || value.feedback.length > 2000)
    return { error: "Write specific feedback of 20 to 2,000 characters." };
  const ratings = [value.clarity, value.correctness, value.testing];
  if (ratings.some((rating) => !Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5))
    return { error: "Rate clarity, correctness and testing from 1 to 5." };
  const { db, id } = await requireStudent();
  const { error } = await db.from("peer_reviews").insert({
    submission_id: value.submissionId,
    reviewer_id: id,
    clarity: value.clarity,
    correctness: value.correctness,
    testing: value.testing,
    feedback: value.feedback.trim(),
  });
  if (error) return { error: "This review could not be saved. You can review each peer project once." };
  revalidatePath("/community");
  return { ok: true };
}

export async function assessCapstone(input: unknown) {
  if (!input || typeof input !== "object") return { error: "Review details are invalid." };
  const value = input as Record<string, unknown>;
  if (typeof value.learnerId !== "string" || typeof value.feedback !== "string" || value.feedback.trim().length < 20 || value.feedback.length > 3000)
    return { error: "Provide the learner and specific feedback." };
  const criteria = ["features", "inputHandling", "dataModel", "tests", "readability", "explanation"] as const;
  const rubric: Record<string, number> = {};
  for (const criterion of criteria) {
    const score = value[criterion];
    if (!Number.isInteger(score) || Number(score) < 0 || Number(score) > 100)
      return { error: "Score each rubric criterion from 0 to 100." };
    rubric[criterion] = Number(score);
  }
  const score = Math.round(
    rubric.features * 0.25 + rubric.inputHandling * 0.15 + rubric.dataModel * 0.15 +
    rubric.tests * 0.2 + rubric.readability * 0.15 + rubric.explanation * 0.1,
  );
  const { db, id } = await requireCourseStaff("cs101", ["instructor", "reviewer", "administrator"]);
  const { error } = await db.from("capstone_reviews").upsert({
    user_id: value.learnerId,
    course_id: "cs101",
    reviewer_id: id,
    score,
    code_tests_passed: value.codeTestsPassed === true,
    rubric,
    feedback: value.feedback.trim(),
    reviewed_at: new Date().toISOString(),
  }, { onConflict: "user_id,course_id" });
  if (error) return { error: "The review could not be saved. Confirm the learner is enrolled." };
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { score, passed: score >= 80 && value.codeTestsPassed === true };
}

export async function issueCredential(input: unknown) {
  if (typeof input !== "string") return { error: "Select a learner." };
  const { db } = await requireCourseStaff("cs101", ["reviewer", "administrator"]);
  const { data, error } = await db.rpc("issue_cs101_credential", { p_learner: input });
  if (error) return { error: error.message.includes("All ten") || error.message.includes("Capstone") ? error.message : "Credential issue failed. Verify the course requirements and reviewer access." };
  revalidatePath("/admin");
  return { code: String(data) };
}
