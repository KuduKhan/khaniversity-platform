"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, ClipboardCheck, Users } from "lucide-react";
import { assessCapstone, createCohort, issueCredential } from "@/modules/community/actions";

type CapstoneSubmission = { id: string; user_id: string; title: string; source_code: string; reflection: string; submitted_at: string; status: "submitted" | "reviewed" | "needs-work" };
type Review = { user_id: string; submission_id: string | null; score: number; code_tests_passed: boolean; reviewed_at: string; feedback: string };
type Audit = { id: number; action: string; target_user_id: string | null; details: Record<string, unknown>; created_at: string };
type Profile = { user_id: string; display_name: string };

export function AcademicOperations({
  role,
  submissions,
  reviews,
  profiles,
  audit,
}: {
  role: string;
  submissions: CapstoneSubmission[];
  reviews: Review[];
  profiles: Profile[];
  audit: Audit[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [cohortTitle, setCohortTitle] = useState("");
  const nameFor = (id: string) => profiles.find((profile) => profile.user_id === id)?.display_name ?? `Learner ${id.slice(0, 8)}`;
  function review(submissionId: string, form: HTMLFormElement) {
    const values = new FormData(form);
    startTransition(async () => {
      const result = await assessCapstone({
        submissionId,
        features: Number(values.get("features")),
        inputHandling: Number(values.get("inputHandling")),
        dataModel: Number(values.get("dataModel")),
        tests: Number(values.get("tests")),
        readability: Number(values.get("readability")),
        explanation: Number(values.get("explanation")),
        codeTestsPassed: values.get("codeTestsPassed") === "on",
        feedback: values.get("feedback"),
      });
      setMessage(result.error ?? `Capstone reviewed · ${result.score}% · ${result.passed ? "requirements met" : "further work required"}`);
      if (!result.error) router.refresh();
    });
  }
  function issue(learnerId: string) {
    startTransition(async () => {
      const result = await issueCredential(learnerId);
      setMessage(result.error ?? `Verified course award issued: ${result.code}`);
      if (!result.error) router.refresh();
    });
  }
  function cohort(form: HTMLFormElement) {
    const values = new FormData(form);
    startTransition(async () => {
      const result = await createCohort({ courseId: "cs101", title: values.get("title") });
      setMessage(result.error ?? `Cohort created with invitation code ${result.cohortId}`);
      if (!result.error) { setCohortTitle(""); router.refresh(); }
    });
  }
  return (
    <div className="operations-page">
      <header className="module-hero"><p className="eyebrow">KHANIVERSITY · ACADEMIC OPERATIONS</p><h1>Review learning evidence.</h1><p className="lead">Role-scoped course operations for the Computer Science Academy.</p><span className="tag">SIGNED IN AS {role.toUpperCase()}</span></header>
      {role === "instructor" || role === "administrator" ? <section className="module-project"><p className="eyebrow"><Users size={14} /> COHORT OPERATIONS</p><h2>Create a CS101 learning cohort.</h2><p>Invitation codes are visible only to cohort members and instructors. Learners must be enrolled to join.</p><form onSubmit={(e) => { e.preventDefault(); cohort(e.currentTarget); }}><label>Cohort name<input name="title" value={cohortTitle} onChange={(e) => setCohortTitle(e.target.value)} minLength={3} maxLength={100} required /></label><button className="button gold" disabled={pending}>Create cohort</button></form></section> : null}
      <section className="operations-section"><p className="eyebrow"><ClipboardCheck size={14} /> CAPSTONE REVIEW QUEUE</p><h2>Submitted capstone projects</h2>
        {submissions.length ? submissions.map((draft) => {
          const existing = reviews.find((review) => review.submission_id === draft.id);
          return <article className="review-card" key={draft.id}><div className="review-card-head"><div><span className="tag">CAPSTONE · {draft.status.toUpperCase()}</span><h3>{draft.title}</h3><p>{nameFor(draft.user_id)} · Last saved {new Date(draft.submitted_at).toLocaleString()}</p></div></div><details><summary>Inspect submitted code</summary><pre><code>{draft.source_code}</code></pre></details><p><strong>Learner reflection:</strong> {draft.reflection || "No reflection submitted yet."}</p>
            {existing && <p className="notice">Prior review: {existing.score}% · {existing.code_tests_passed ? "Coding checks passed" : "Coding checks not passed"} · {new Date(existing.reviewed_at).toLocaleDateString()}</p>}
            {draft.status === "submitted" && <form className="rubric-form" onSubmit={(e) => { e.preventDefault(); review(draft.id, e.currentTarget); }}>
              <p className="eyebrow">CAPSTONE RUBRIC · WEIGHTED REVIEW</p>
              <label>Feature completeness · 25%<input name="features" type="number" min="0" max="100" defaultValue={existing?.score ?? 80} required /></label>
              <label>Input handling · 15%<input name="inputHandling" type="number" min="0" max="100" defaultValue={80} required /></label>
              <label>Data organization · 15%<input name="dataModel" type="number" min="0" max="100" defaultValue={80} required /></label>
              <label>Test coverage · 20%<input name="tests" type="number" min="0" max="100" defaultValue={80} required /></label>
              <label>Code readability · 15%<input name="readability" type="number" min="0" max="100" defaultValue={80} required /></label>
              <label>Design explanation · 10%<input name="explanation" type="number" min="0" max="100" defaultValue={80} required /></label>
              <label className="inline-check"><input type="checkbox" name="codeTestsPassed" defaultChecked={existing?.code_tests_passed ?? false} /> I ran the required Python checks and verified the submission</label>
              <label>Feedback<textarea name="feedback" minLength={20} maxLength={3000} defaultValue={existing?.feedback ?? ""} rows={4} required /></label>
              <button className="button outline" disabled={pending}>Record independent assessment</button>
            </form>}
            {(role === "reviewer" || role === "administrator") && existing && existing.score >= 80 && existing.code_tests_passed && <button className="button gold" onClick={() => issue(draft.user_id)} disabled={pending}><Award size={16} /> Issue credential if all requirements pass</button>}
          </article>;
        }) : <p className="empty-evidence">No formal capstone submissions yet. Student drafts are private and are not assessed until submitted.</p>}
      </section>
      <section className="operations-section"><p className="eyebrow">AUDIT TRAIL</p><h2>Recent academic actions</h2>{audit.length ? audit.map((entry) => <article className="audit-row" key={entry.id}><strong>{entry.action}</strong><span>{entry.target_user_id ? nameFor(entry.target_user_id) : "System"}</span><small>{new Date(entry.created_at).toLocaleString()}</small><code>{JSON.stringify(entry.details)}</code></article>) : <p className="empty-evidence">No academic actions have been recorded.</p>}</section>
      <p role="status" className="save-error">{message}</p>
    </div>
  );
}
