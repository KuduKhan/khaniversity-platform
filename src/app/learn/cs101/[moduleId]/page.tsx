import { notFound, redirect } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { CourseModule } from "@/components/course-module";
import { getCourseModule } from "@/modules/academics/curriculum";
import { redactAssessmentAnswers } from "@/modules/academics/transport";
import { requireStudent } from "@/lib/database/server";

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
  const draftResult = courseModule.project
    ? await db
        .from("project_drafts")
        .select("title,source_code,reflection")
        .eq("user_id", id)
        .eq("course_id", "cs101")
        .maybeSingle()
    : { data: null };
  return (
    <StudentShell preview={false} active="lesson" email={email}>
      <CourseModule
        module={redactAssessmentAnswers(courseModule)}
        preview={false}
        initialScore={data?.score ?? null}
        initialDraft={draftResult.data ? {
          title: draftResult.data.title,
          code: draftResult.data.source_code,
          reflection: draftResult.data.reflection,
        } : null}
      />
    </StudentShell>
  );
}
