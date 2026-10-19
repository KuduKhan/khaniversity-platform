import { StudentShell } from "@/components/student-shell";
import { SkillsPassport } from "@/components/learning-tools";
export default function PassportPage() {
  return (
    <StudentShell preview active="passport">
      <SkillsPassport />
    </StudentShell>
  );
}
