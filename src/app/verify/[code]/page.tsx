import Link from "next/link";
import { database } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function VerifyCredentialPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).trim().slice(0, 80);
  let record: { status: string; recipient_name: string; course_title: string; issued_at: string; evidence_summary: string } | null = null;
  let unavailable = false;
  try {
    const db = await database();
    const { data, error } = await db.rpc("verify_course_credential", { p_code: normalized });
    if (error) unavailable = true;
    else record = Array.isArray(data) ? data[0] ?? null : null;
  } catch {
    unavailable = true;
  }
  return <main id="main" className="section catalog-page credential-verification">
    <p className="eyebrow">KHANIVERSITY · CREDENTIAL REGISTER</p>
    <h1>{unavailable ? "Verification is temporarily unavailable." : record ? record.status === "valid" ? "Credential verified." : "Credential revoked." : "No matching credential."}</h1>
    <p className="lead">Reference code: <code>{normalized || "—"}</code></p>
    {record && <section className="tool-panel"><span className="tag">{record.status.toUpperCase()}</span><h2>{record.recipient_name}</h2><p>{record.course_title}</p><p>Issued {new Date(record.issued_at).toLocaleDateString()}</p><p>{record.evidence_summary}</p></section>}
    {unavailable && <p className="notice">The credential register requires a connected university database. Try again when the service is available.</p>}
    <Link className="text-link" href="/">Return to KHANIVERSITY</Link>
  </main>;
}
