import { StudentShell } from "@/components/student-shell";
import { AcademicOperations } from "@/components/academic-operations";
import { CurriculumRegister } from "@/components/curriculum-register";
import { requireCourseStaff } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function AcademicOperationsPage() {
  const { db, email, role } = await requireCourseStaff("cs101");
  const [{ data: drafts }, { data: audit }, registeredModules, registeredLessons] = await Promise.all([
    db.from("project_drafts").select("user_id,title,source_code,reflection,updated_at").eq("course_id", "cs101").order("updated_at", { ascending: false }).limit(100),
    db.from("audit_logs").select("id,action,target_user_id,details,created_at").eq("course_id", "cs101").order("created_at", { ascending: false }).limit(40),
    db.from("modules").select("id,title").eq("course_id", "cs101").order("id"),
    db.from("lessons").select("id,module_id,title,content_version,published").order("module_id"),
  ]);
  if (registeredModules.error || registeredLessons.error)
    throw new Error("The academic publication register is temporarily unavailable.");
  const learnerIds = [...new Set((drafts ?? []).map((draft) => draft.user_id))];
  const [{ data: profiles }, { data: reviews }] = learnerIds.length
    ? await Promise.all([
        db.from("profiles").select("user_id,display_name").in("user_id", learnerIds),
        db.from("capstone_reviews").select("user_id,score,code_tests_passed,reviewed_at,feedback").in("user_id", learnerIds),
      ])
    : [{ data: [] }, { data: [] }];
  return (
    <StudentShell preview={false} active="admin" email={email} staff>
      <CurriculumRegister modules={registeredModules.data ?? []} lessons={registeredLessons.data ?? []} />
      <AcademicOperations
        role={role}
        drafts={drafts ?? []}
        reviews={reviews ?? []}
        profiles={profiles ?? []}
        audit={audit ?? []}
      />
    </StudentShell>
  );
}
