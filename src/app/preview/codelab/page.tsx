import { StudentShell } from "@/components/student-shell";
import { CodeLab } from "@/components/learning-tools";
export default function CodeLabPage() {
  return (
    <StudentShell preview active="codelab">
      <CodeLab preview />
    </StudentShell>
  );
}
