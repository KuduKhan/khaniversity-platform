import { TechLabs } from "@/components/learning-tools";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function TechnologyLabsPage() {
  const { email } = await requireStudent();
  return <StudentShell preview={false} active="labs" email={email}><TechLabs /></StudentShell>;
}
