"use client";

import { useState } from "react";
import { proposeLessonMaterial, reviewLessonMaterial } from "@/modules/curriculum/actions";
import styles from "./academic-workflow.module.css";

export type FacultyRevision = {
  id: number; lesson_id: string; title: string; body: string;
  status: string; created_at: string; review_note: string; author_id: string;
};
export function CurriculumWorkflow({
  role, revisions, options,
}: { role: string; revisions: FacultyRevision[]; options: { id: string; title: string }[] }) {
  const [lessonId,setLessonId] = useState(options[0]?.id ?? "");
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [pending,setPending] = useState(false);
  const [message,setMessage] = useState("");
  const [reviews,setReviews] = useState<Record<number,{note:string;busy:boolean}>>({});
  const [done,setDone] = useState<number[]>([]);
  const canAuthor = role === "instructor" || role === "administrator";
  const canReview = role === "reviewer" || role === "administrator";

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setPending(true); setMessage("");
    try {
      const result = await proposeLessonMaterial({ lessonId,title,body });
      if (result.error) setMessage(result.error);
      else { setMessage("Proposal submitted for independent academic review. Refresh the register to see its record."); setTitle(""); setBody(""); }
    } catch { setMessage("Proposal could not be submitted."); }
    finally { setPending(false); }
  }
  async function review(id: number, approve: boolean) {
    const current=reviews[id] ?? {note:"",busy:false};
    setReviews(v=>({...v,[id]:{...current,busy:true}})); setMessage("");
    try {
      const result = await reviewLessonMaterial({id,approve,note:current.note});
      if(result.error) setMessage(result.error);
      else { setDone(v=>[...v,id]); setMessage("Decision saved and recorded in the academic audit trail."); }
    } catch { setMessage("Could not record this decision."); }
    finally { setReviews(v=>({...v,[id]:{note:current.note,busy:false}})); }
  }
  return <section className={styles.panel} aria-labelledby="faculty-workflow">
    <span className="eyebrow">ACADEMIC GOVERNANCE · WORKING REVIEW SYSTEM</span>
    <h2 id="faculty-workflow">Lesson content and approvals</h2>
    <p>Instructors submit additional teaching materials against a published CS101 lesson version. A different authorized reviewer approves or rejects each submission before students can see it. Assessment answer keys are never editable here.</p>
    {canAuthor && <form className={styles.form} onSubmit={submit}>
      <h3>Propose teaching material</h3>
      <label>Lesson
        <select value={lessonId} required onChange={e=>setLessonId(e.target.value)}>
          {options.map(o=><option value={o.id} key={o.id}>{o.title}</option>)}
        </select>
      </label>
      <label>Title <input required minLength={5} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="What should the student learn?" /></label>
      <label>Teaching material (80–8,000 characters)
        <textarea required minLength={80} maxLength={8000} rows={8} value={body} onChange={e=>setBody(e.target.value)} placeholder="Explain the topic, show a worked example and a reflective exercise. Never include graded answers." />
      </label>
      <button className="button gold" disabled={pending||!lessonId}>{pending?"Submitting…":"Submit for independent review"}</button>
    </form>}
    <h3>Publication and review queue</h3>
    {revisions.length===0 ? <p>No proposals submitted yet. An assigned instructor can create the first.</p>
      : <div className={styles.queue}>{revisions.map(item=><article className={styles.card} key={item.id}>
        <div className={styles.top}><strong>{item.title}</strong><span className="tag">{done.includes(item.id) ? "Decision saved" : item.status}</span></div>
        <small>Lesson: {item.lesson_id} · Version proposal #{item.id} · {new Date(item.created_at).toLocaleDateString()}</small>
        <p className={styles.excerpt}>{item.body}</p>
        {item.review_note && <p><strong>Review note:</strong> {item.review_note}</p>}
        {canReview && item.status==="pending" && !done.includes(item.id) && <div className={styles.review}>
          <label>Reviewer note <textarea maxLength={1500} rows={2} value={reviews[item.id]?.note??""} onChange={e=>setReviews(v=>({...v,[item.id]:{note:e.target.value,busy:false}}))}/></label>
          <div className={styles.buttons}>
            <button type="button" className="button gold" disabled={reviews[item.id]?.busy} onClick={()=>review(item.id,true)}>Publish approved material</button>
            <button type="button" className="button outline" disabled={reviews[item.id]?.busy} onClick={()=>review(item.id,false)}>Reject with feedback</button>
          </div>
          <small>Authors cannot approve their own submissions; the database enforces separation of duties.</small>
        </div>}
      </article>)}</div>}
    <p role="status" className="save-error">{message}</p>
  </section>;
}
