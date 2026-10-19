"use client";

import { useState } from "react";
import { reviewCodeSubmission } from "@/modules/codelab/actions";
import styles from "./academic-workflow.module.css";

export type StaffCodeSubmission = {
  id: string; user_id: string; source_code: string; status: string;
  submitted_at: string; code_tests_passed: boolean; feedback: string;
};
export function CodeReviewQueue({ submissions }: { submissions: StaffCodeSubmission[] }) {
  const [notes,setNotes] = useState<Record<string,string>>({});
  const [confirmed,setConfirmed] = useState<Record<string,boolean>>({});
  const [busy,setBusy] = useState<string|null>(null);
  const [finished,setFinished] = useState<string[]>([]);
  const [message,setMessage] = useState("");
  async function decide(submission: StaffCodeSubmission, passed: boolean) {
    setBusy(submission.id); setMessage("");
    try {
      const res=await reviewCodeSubmission({id:submission.id,passed,confirmed:!!confirmed[submission.id],feedback:notes[submission.id]??""});
      if(res.error)setMessage(res.error);
      else {setFinished(v=>[...v,submission.id]);setMessage("Submission reviewed and audited. Learner history now reflects this decision.");}
    } catch {setMessage("Unable to save this review.");}
    finally {setBusy(null);}
  }
  return <section className={styles.panel} aria-labelledby="code-review-queue">
    <span className="eyebrow">CODELAB · REAL STUDENT SUBMISSIONS</span>
    <h2 id="code-review-queue">Python submission review</h2>
    <p>Account-backed submissions are private by default. Learner-run browser checks are not trusted academic grades. A designated staff member inspects code and independently verifies tests before recording a result.</p>
    {!submissions.length?<p>No submissions yet. Student submissions will appear here after enrollment and sign-in.</p>:
    <div className={styles.queue}>{submissions.map(item=><article key={item.id} className={styles.card}>
      <div className={styles.top}><strong>Student coding attempt</strong><span className="tag">{finished.includes(item.id)?"Decision saved":item.status}</span></div>
      <small>Submitted {new Date(item.submitted_at).toLocaleString()} · submission {item.id.slice(0,8)}</small>
      <pre className={styles.source}><code>{item.source_code}</code></pre>
      {item.feedback && <p>Recorded feedback: {item.feedback}</p>}
      {item.status==="submitted" && !finished.includes(item.id) && <div className={styles.review}>
        <label>Reviewer feedback<textarea rows={2} maxLength={1500} value={notes[item.id]??""} onChange={e=>setNotes(v=>({...v,[item.id]:e.target.value}))}/></label>
        <label className={styles.checkbox}><input type="checkbox" checked={!!confirmed[item.id]} onChange={e=>setConfirmed(v=>({...v,[item.id]:e.target.checked}))}/> I independently verified the required Python tests in an appropriate isolated environment</label>
        <div className={styles.buttons}>
          <button type="button" className="button gold" disabled={busy===item.id||!confirmed[item.id]} onClick={()=>decide(item,true)}>Mark checks verified</button>
          <button type="button" className="button outline" disabled={busy===item.id} onClick={()=>decide(item,false)}>Return for revision</button>
        </div>
      </div>}
    </article>)}</div>}
    <p role="status" className="save-error">{message}</p>
  </section>;
}
