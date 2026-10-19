import { notFound, redirect } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { CourseModule } from "@/components/course-module";
import { getCourseModule } from "@/modules/academics/curriculum";
import { redactAssessmentAnswers } from "@/modules/academics/transport";
import { requireStudent } from "@/lib/database/server";
import { latestApprovedMaterial } from "@/modules/curriculum/published";

export const dynamic = "force-dynamic";

export default async function StudentCourseModule({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const courseModule = getCourseModule(moduleId);
  if (!courseModule || moduleId === "computational-thinking") notFound();
  const { db, id, email } = await requireStudent();
  const { data: enrollment, error: enrollmentError } = await db
    .from("enrollments")
    .select("course_id")
    .eq("user_id", id)
    .eq("course_id", "cs101")
    .maybeSingle();
  if (enrollmentError) throw new Error("Unable to verify your course enrollment.");
  if (!enrollment) redirect("/dashboard");
  const { data } = await db
    .from("lesson_progress")
    .select("score")
    .eq("user_id", id)
    .eq("lesson_id", courseModule.id)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();
  const approvedMaterial = await latestApprovedMaterial(courseModule.id);
  const draftResult = courseModule.project
    ? await db
        .from("project_drafts")
        .select("title,source_code,reflection")
        .eq("user_id", id)
        .eq("course_id", "cs101")
        .maybeSingle()
    : { data: null };
  const submissionResult = courseModule.project ? await db.from("capstone_submissions")
    .select("id,status,submitted_at").eq("user_id",id).eq("course_id","cs101")
    .order("submitted_at",{ ascending:false }).limit(1).maybeSingle() : { data: null, error: null };
  const reviewResult = courseModule.project ? await db.from("capstone_reviews")
    .select("submission_id,feedback").eq("user_id",id).eq("course_id","cs101").maybeSingle() : { data: null, error: null };
  if (submissionResult.error || reviewResult.error) throw new Error("Could not load your capstone submission status.");
  return (
    <StudentShell preview={false} active="lesson" email={email}>
      <CourseModule
        module={redactAssessmentAnswers(courseModule)}
        preview={false}
        approvedMaterial={approvedMaterial}
        initialScore={data?.score ?? null}
        initialSubmission={submissionResult.data ? {
          ...submissionResult.data,
          feedback: reviewResult.data?.submission_id === submissionResult.data.id ? reviewResult.data.feedback : undefined,
        } : null}
        initialDraft={draftResult.data ? {
          title: draftResult.data.title,
          code: draftResult.data.source_code,
          reflection: draftResult.data.reflection,
        } : null}
      />
    </StudentShell>
  );
}
