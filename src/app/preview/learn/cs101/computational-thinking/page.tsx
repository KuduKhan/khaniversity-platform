import { StudentShell } from "@/components/student-shell";
import { Lesson } from "@/components/lesson";
import { questions } from "@/modules/academics/catalog";
export default function PreviewLesson() {
  return (
    <StudentShell preview active="lesson">
      <Lesson preview scope="preview" questions={questions} />
    </StudentShell>
  );
}
