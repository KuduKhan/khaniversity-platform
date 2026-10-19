import { CodeLab } from "@/components/learning-tools";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function CodeLabPage() {
  const { id, email, db } = await requireStudent();
  const { data, error } = await db.from("code_submissions")
    .select("id,source_code,status,code_tests_passed,feedback,submitted_at")
    .eq("user_id", id).eq("course_id", "cs101")
    .order("submitted_at", { ascending: false }).limit(10);
  if (error) throw new Error("Unable to load your CodeLab submission history.");
  return <StudentShell preview={false} active="codelab" email={email}>
    <CodeLab preview={false} accountId={id} savedSubmissions={(data ?? []) as import("@/modules/codelab/actions").SavedCodeSubmission[]} />
  </StudentShell>;
}
