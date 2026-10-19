import { StudentShell } from "@/components/student-shell";
import { TechLabs } from "@/components/learning-tools";
export default function LabsPage() {
  return (
    <StudentShell preview active="labs">
      <TechLabs />
    </StudentShell>
  );
}
