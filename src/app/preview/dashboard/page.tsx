import { StudentShell } from "@/components/student-shell";
import { Dashboard } from "@/components/dashboard";
export default function Preview() {
  return (
    <StudentShell preview>
      <Dashboard preview scope="preview" />
    </StudentShell>
  );
}
