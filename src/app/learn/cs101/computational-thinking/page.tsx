import { StudentShell } from "@/components/student-shell";
import { Lesson } from "@/components/lesson";
import { studentState } from "@/modules/enrollments/state";
import { questions } from "@/modules/academics/catalog";
export const dynamic = "force-dynamic";
export default async function StudentLesson() {
  const { state, email } = await studentState();
  return (
    <StudentShell preview={false} active="lesson" email={email}>
      <Lesson preview={false} initial={state} questions={questions.map(({ prompt, options, explanation }) => ({ prompt, options, explanation }))} />
    </StudentShell>
  );
}
