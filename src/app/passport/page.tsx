import { SkillsPassport } from "@/components/learning-tools";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function SkillsPassportPage() {
  const { email, db, id } = await requireStudent();
  const { data: credentials } = await db.from("credentials").select("credential_code,title,issued_at").eq("user_id", id).order("issued_at", { ascending: false });
  return <StudentShell preview={false} active="passport" email={email}><SkillsPassport />{credentials?.length ? <section className="operations-section"><p className="eyebrow">UNIVERSITY CREDENTIAL REGISTER</p><h2>Verified course awards</h2>{credentials.map((credential) => <article className="audit-row" key={credential.credential_code}><strong>{credential.title}</strong><span>{credential.credential_code}</span><small>{new Date(credential.issued_at).toLocaleDateString()}</small><a href={`/verify/${encodeURIComponent(credential.credential_code)}`}>Verify this credential</a></article>)}</section> : null}</StudentShell>;
}
