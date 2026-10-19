import { CodeLab } from "@/components/learning-tools";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function CodeLabPage() {
  const { email } = await requireStudent();
  return <StudentShell preview={false} active="codelab" email={email}><CodeLab /></StudentShell>;
}
