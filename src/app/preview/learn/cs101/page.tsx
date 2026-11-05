import { StudentShell } from "@/components/student-shell";
import { CourseOverview } from "@/components/course-overview";

export default function PreviewLearning() {
  return (
    <StudentShell preview active="syllabus">
      <CourseOverview preview />
    </StudentShell>
  );
}
