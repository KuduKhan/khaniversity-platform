import { StudentShell } from "@/components/student-shell";
import { CourseOverview } from "@/components/course-overview";
import { studentState } from "@/modules/enrollments/state";

export const dynamic = "force-dynamic";

export default async function MyLearning() {
  const { state, email, id, isStaff } = await studentState();
  void id;
  return (
    <StudentShell preview={false} active="syllabus" email={email} staff={isStaff}>
      <CourseOverview preview={false} initial={state} />
    </StudentShell>
  );
}
