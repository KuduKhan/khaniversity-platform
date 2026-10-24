import { StudentShell } from "@/components/student-shell";
import { Dashboard } from "@/components/dashboard";
import { studentState } from "@/modules/enrollments/state";
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const { state, email, id, isStaff } = await studentState();
  return (
    <StudentShell preview={false} email={email} staff={isStaff}>
      <Dashboard preview={false} scope={id} initial={state} />
    </StudentShell>
  );
}
