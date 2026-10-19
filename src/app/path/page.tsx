import { AdaptivePath } from "@/components/learning-tools";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function AdaptivePathPage() {
  const { email } = await requireStudent();
  return <StudentShell preview={false} active="diagnostic" email={email}><AdaptivePath preview={false} /></StudentShell>;
}
