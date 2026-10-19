import { StudentShell } from "@/components/student-shell";
import { AcademicOperations } from "@/components/academic-operations";
import { CurriculumRegister } from "@/components/curriculum-register";
import { CurriculumWorkflow } from "@/components/curriculum-workflow";
import { CodeReviewQueue } from "@/components/code-review-queue";
import { StaffManagement } from "@/components/staff-management";
import { getCourseModule } from "@/modules/academics/curriculum";

import { requireCourseStaff } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function AcademicOperationsPage() {
  const { db, email, role } = await requireCourseStaff("cs101");
  const [{ data: drafts }, { data: audit }, registeredModules, registeredLessons, revisions, codeQueue, studentEnrollments, staffAssignments] = await Promise.all([
    db.from("capstone_submissions").select("id,user_id,title,source_code,reflection,submitted_at,status").eq("course_id", "cs101").order("submitted_at", { ascending: false }).limit(100),
    db.from("audit_logs").select("id,action,target_user_id,details,created_at").eq("course_id", "cs101").order("created_at", { ascending: false }).limit(40),
    db.from("modules").select("id,title").eq("course_id", "cs101").order("id"),
    db.from("lessons").select("id,module_id,title,content_version,published").order("module_id"),
    db.from("lesson_revisions").select("id,lesson_id,title,body,status,created_at,review_note,author_id")
      .eq("course_id", "cs101").order("id", { ascending: false }).limit(50),
    db.from("code_submissions").select("id,user_id,source_code,status,submitted_at,code_tests_passed,feedback")
      .eq("course_id", "cs101").order("submitted_at", { ascending: false }).limit(50),
    db.from("enrollments").select("user_id", { count: "exact", head: true }).eq("course_id", "cs101"),
    db.from("course_staff").select("user_id,role,granted_at").eq("course_id","cs101").order("granted_at", { ascending: false }),
  ]);
  if (registeredModules.error || registeredLessons.error || revisions.error || codeQueue.error || studentEnrollments.error || staffAssignments.error)
    throw new Error("The academic publication register is temporarily unavailable.");
  const learnerIds = [...new Set((drafts ?? []).map((draft) => draft.user_id))];
  const [{ data: profiles }, { data: reviews }] = learnerIds.length
    ? await Promise.all([
        db.from("profiles").select("user_id,display_name").in("user_id", learnerIds),
        db.from("capstone_reviews").select("user_id,submission_id,score,code_tests_passed,reviewed_at,feedback").in("user_id", learnerIds),
      ])
    : [{ data: [] }, { data: [] }];
  return (
    <StudentShell preview={false} active="admin" email={email} staff>
      <section className="tool-panel" aria-label="Live CS101 operational metrics">
        <span className="eyebrow">CS101 · CURRENT COHORT</span>
        <h2>Academic operations at a glance</h2>
        <p>{studentEnrollments.count ?? 0} enrolled students · {codeQueue.data?.filter(x=>x.status==="submitted").length ?? 0} recent code reviews pending · {revisions.data?.filter(x=>x.status==="pending").length ?? 0} curriculum proposals pending. Code and proposal queues display the latest 50 records.</p>
      </section>
      <CurriculumWorkflow role={role}
        revisions={revisions.data ?? []}
        options={(registeredLessons.data ?? []).filter(lesson=>lesson.published && getCourseModule(lesson.id))
          .map(lesson=>({id:lesson.id,title:lesson.title}))}
      />
      <CodeReviewQueue submissions={codeQueue.data ?? []} />
      {role === "administrator" && <StaffManagement staff={staffAssignments.data ?? []} />}
      <CurriculumRegister modules={registeredModules.data ?? []} lessons={registeredLessons.data ?? []} />
      <AcademicOperations
        role={role}
        submissions={drafts ?? []}
        reviews={reviews ?? []}
        profiles={profiles ?? []}
        audit={audit ?? []}
      />
    </StudentShell>
  );
}
