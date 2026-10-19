import { AccountPassport } from "@/components/account-passport";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";
import { buildAccountEvidence } from "@/modules/academics/evidence";

export const dynamic = "force-dynamic";

export default async function SkillsPassportPage() {
  const { email, db, id } = await requireStudent();
  const [progress, awards] = await Promise.all([
    db.from("lesson_progress")
      .select("lesson_id,content_version,score,completed,updated_at")
      .eq("user_id", id)
      .order("updated_at", { ascending: false }),
    db.from("credentials")
      .select("credential_code,title,issued_at")
      .eq("user_id", id)
      .order("issued_at", { ascending: false }),
  ]);
  if (progress.error || awards.error)
    throw new Error("Your learning record is temporarily unavailable.");
  const evidence = buildAccountEvidence(progress.data || []);
  const credentials = awards.data || [];
  return (
    <StudentShell preview={false} active="passport" email={email}>
      <AccountPassport records={evidence} />
      {credentials.length > 0 && <section className="operations-section">
        <p className="eyebrow">KHANIVERSITY · AWARD REGISTER</p>
        <h2>University-issued course awards</h2>
        <p>These awards require a reviewed capstone and can be checked against the university register. They are not accredited degrees or cryptographically signed certificates.</p>
        {credentials.map((credential) => (
          <article className="audit-row" key={credential.credential_code}>
            <strong>{credential.title}</strong>
            <span>{credential.credential_code}</span>
            <small>Issued {new Date(credential.issued_at).toLocaleDateString()}</small>
            <a href={`/verify/${encodeURIComponent(credential.credential_code)}`}>Check award in university register</a>
          </article>
        ))}
      </section>}
    </StudentShell>
  );
}
