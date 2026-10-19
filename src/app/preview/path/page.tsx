import { StudentShell } from "@/components/student-shell";
import { AdaptivePath } from "@/components/learning-tools";
export default function PathPage() {
  return (
    <StudentShell preview active="diagnostic">
      <AdaptivePath preview />
    </StudentShell>
  );
}
