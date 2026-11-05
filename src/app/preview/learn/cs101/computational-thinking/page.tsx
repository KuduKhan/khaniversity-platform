import { StudentShell } from "@/components/student-shell";
import { Lesson } from "@/components/lesson";
import { questions } from "@/modules/academics/catalog";
import { getCourseModule } from "@/modules/academics/curriculum";
export default function PreviewLesson() {
  return (
    <StudentShell preview active="lesson">
      <Lesson preview scope="preview" questions={questions} appliedExample={getCourseModule("computational-thinking")?.sections[2]} />
    </StudentShell>
  );
}
