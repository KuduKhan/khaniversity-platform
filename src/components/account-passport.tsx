"use client";
import Link from "next/link";
import type { AccountEvidence } from "@/modules/academics/evidence";

export function AccountPassport({ records }: { records: AccountEvidence[] }) {
  function exportRecord() {
    const data = {
      title: "KHANIVERSITY · Account Learning Record",
      exportedAt: new Date().toISOString(),
      source: "authenticated student learning record",
      verified: false,
      note: "Formative assessment summary only. This editable export is not an official certificate.",
      records,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "khaniversity-account-learning-record.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return <div className="tool-page">
    <p className="eyebrow">STUDENTOS · LEARNING EVIDENCE</p>
    <h1>Your account Skills Passport</h1>
    <p className="tool-lede">Your formative CS101 assessment record comes from your university account. Browser-local preview activity is intentionally excluded.</p>
    <section className="tool-panel">
      <div className="passport-head">
        <div>
          <span className="tag">ACCOUNT-BACKED FORMATIVE RECORD</span>
          <h2>See what you have demonstrated.</h2>
          <p>Retake a lesson check to strengthen a low score. University-issued awards have separate review and eligibility requirements.</p>
        </div>
        <button className="button outline" disabled={!records.length} onClick={exportRecord}>Export learning record JSON</button>
      </div>
      {records.length ? <div className="evidence-list">
        {records.map((record) => <article key={record.id}>
          <span className="evidence-mark" aria-hidden="true">{record.mastered ? "✓" : "↻"}</span>
          <div>
            <strong>{record.label}</strong>
            <small>{record.mastered ? "Formative check mastered" : "Revise and retry"} · {new Date(record.completedAt).toLocaleDateString()}</small>
          </div>
          <b>{record.score}%</b>
        </article>)}
      </div> : <div className="empty-evidence">
        No recorded assessments yet. <Link href="/dashboard">Open your CS101 learning path</Link> to begin.
      </div>}
      <p className="fine-print">The exported file is editable and not independently verified. Official awards, if any, appear separately below.</p>
    </section>
  </div>;
}
