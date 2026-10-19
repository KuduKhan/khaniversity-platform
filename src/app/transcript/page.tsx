import Link from "next/link";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";
import { summarizeTranscript, type TranscriptData } from "@/modules/academics/transcript";
import { courseModules } from "@/modules/academics/curriculum";
import styles from "./transcript.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Private Academic Record | KHANIVERSITY" };

function dateLabel(value: string | null) {
  if (!value) return "Awaiting review";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
const moduleNames = new Map(courseModules.map((lesson, index) =>
  [index === 0 ? "cs101-01" : `cs101-${String(index + 1).padStart(2, "0")}`, lesson.title] as const,
));

export default async function AcademicRecordPage() {
  const { db, id, email } = await requireStudent();
  const [progress, attempts, code, capstones, reviews, awards, diagnostics, enrollment] = await Promise.all([
    db.from("lesson_progress").select("lesson_id,content_version,score,completed,updated_at").eq("user_id",id).order("updated_at", { ascending:false }),
    db.from("assessment_attempts").select("id,module_id,score,submitted_at").eq("user_id", id).order("submitted_at", { ascending: false }).limit(100),
    db.from("code_submissions").select("id,exercise_id,status,code_tests_passed,feedback,submitted_at,reviewed_at").eq("user_id", id).eq("course_id","cs101").order("submitted_at", { ascending: false }).limit(100),
    db.from("capstone_submissions").select("id,title,status,submitted_at,reviewed_at").eq("user_id", id).eq("course_id","cs101").order("submitted_at", { ascending: false }).limit(100),
    db.from("capstone_reviews").select("submission_id,score,code_tests_passed,feedback,reviewed_at").eq("user_id",id).eq("course_id","cs101").order("reviewed_at", { ascending: false }).limit(100),
    db.from("credentials").select("credential_code,title,issued_at,revoked_at").eq("user_id",id).eq("course_id","cs101").order("issued_at", { ascending: false }).limit(100),
    db.from("learning_diagnostics").select("score,created_at").eq("user_id",id).eq("course_id","cs101").order("created_at", { ascending: false }).limit(10),
    db.from("enrollments").select("course_id").eq("user_id",id).eq("course_id","cs101").maybeSingle(),
  ]);
  if ([progress,attempts,code,capstones,reviews,awards,diagnostics,enrollment].some(item => item.error))
    throw new Error("Your private academic record is temporarily unavailable. Please retry.");

  const data: TranscriptData = {
    progress: progress.data ?? [], attempts: attempts.data ?? [], code: code.data ?? [], capstones: capstones.data ?? [],
    reviews: reviews.data ?? [], awards: awards.data ?? [], diagnostics: diagnostics.data ?? [],
  };
  const totals = summarizeTranscript(data);
  return <StudentShell preview={false} active="transcript" email={email}>
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>STUDENTOS · PRIVATE ACADEMIC RECORD</span>
        <h1>Your work, in one place.</h1>
        <p>Review recorded assessments, submitted code, capstone decisions and academy awards. Your account alone can view this record; staff access is controlled separately.</p>
        <span className={styles.enrollment}>{enrollment.data ? "CS101 · Enrolled" : "CS101 · Enrollment not yet recorded"}</span>
      </header>
      <section aria-label="Academic record summary" className={styles.stats}>
        <div><strong>{totals.masteredModules} / 10</strong><span>Modules mastered in your current learning record</span></div>
        <div><strong>{totals.pendingReviews}</strong><span>Submissions awaiting academic review</span></div>
        <div><strong>{totals.reviewedCode}</strong><span>Staff-reviewed passing code submissions</span></div>
        <div><strong>{totals.activeAwards}</strong><span>Active internal academy awards</span></div>
      </section>
      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="assessment-heading">
          <div className={styles.sectionHeading}><h2 id="assessment-heading">Assessment history</h2><Link href="/dashboard">Return to lessons →</Link></div>
          {data.attempts.length ? <ol className={styles.history}>{data.attempts.map(item => <li className={styles.entry} key={item.id}>
            <div><strong>{moduleNames.get(item.module_id) ?? item.module_id}</strong><small>{dateLabel(item.submitted_at)} · {item.score >= 80 ? "Passed" : "Revision recommended"}</small></div>
            <b>{item.score}%</b>
          </li>)}</ol> : <p className={styles.empty}>No official assessment attempts recorded yet. <Link href="/dashboard">Start a CS101 lesson</Link>.</p>}
          <p className={styles.footnote}>Displays the 100 most recent attempts. A check score is formative evidence; it does not independently award a credential.</p>
        </section>
        <section className={styles.panel} aria-labelledby="code-heading">
          <div className={styles.sectionHeading}><h2 id="code-heading">Python code reviews</h2><Link href="/codelab">Open CodeLab →</Link></div>
          {data.code.length ? <ol className={styles.history}>{data.code.map(item => <li className={styles.entry} key={item.id}>
            <div><strong>{item.exercise_id.replaceAll("-", " ")}</strong><small>{dateLabel(item.submitted_at)} · {item.status === "submitted" ? "Awaiting staff review" : item.status === "reviewed" && item.code_tests_passed ? "Approved with tests passed" : "Revisions requested"}</small>
            {item.feedback && <p className={styles.feedback}>{item.feedback}</p>}</div>
          </li>)}</ol> : <p className={styles.empty}>No submitted code yet. Browser-only practice is not a formal submission.</p>}
          <p className={styles.footnote}>Shows your 100 most recent submitted exercises, not browser-local drafts.</p>
        </section>
        <section className={styles.panel} aria-labelledby="capstone-heading">
          <div className={styles.sectionHeading}><h2 id="capstone-heading">Capstone submissions</h2><Link href="/learn/cs101/personal-study-planner-capstone">View capstone →</Link></div>
          {data.capstones.length ? <ol className={styles.history}>{data.capstones.map(item => {
            const review = totals.reviewedCapstones.get(item.id);
            return <li className={styles.entry} key={item.id}><div>
              <strong>{item.title}</strong><small>Submitted {dateLabel(item.submitted_at)} · {item.status === "submitted" ? "Awaiting independent review" : item.status === "reviewed" ? "Reviewed · passed" : "Needs further work"}</small>
              {review && <p className={styles.feedback}>Staff rubric: {review.score}% · Code checks: {review.code_tests_passed ? "passed" : "not passed"}{review.feedback ? ` · ${review.feedback}` : ""}</p>}
            </div></li>;
          })}</ol> : <p className={styles.empty}>Your saved draft is private until you explicitly submit it for review.</p>}
          <p className={styles.footnote}>Formal submissions are snapshots. Editing a draft does not change a previously submitted project.</p>
        </section>
        <section className={styles.panel} aria-labelledby="awards-heading">
          <div className={styles.sectionHeading}><h2 id="awards-heading">Award verification</h2><Link href="/passport">Skills Passport →</Link></div>
          {data.awards.length ? <ol className={styles.history}>{data.awards.map(item => <li className={styles.entry} key={item.credential_code}>
            <div><strong>{item.title}</strong><small>Issued {dateLabel(item.issued_at)} · {item.revoked_at ? "Revoked" : "Active"}</small>
              <Link className={styles.verify} href={`/verify/${encodeURIComponent(item.credential_code)}`}>Verify award in register →</Link>
            </div>
          </li>)}</ol> : <p className={styles.empty}>No internal academy award has been issued. Passing checks alone does not create an award.</p>}
          <p className={styles.footnote}>Academy-issued records are not accredited degrees or external professional certifications.</p>
        </section>
      </div>
      <p className={styles.dataNotice}>Privacy: record queries use the signed-in account identity and Supabase row-level security. The lists show recent history, not an official exhaustive transcript. For local-only practice records, use the preview Skills Passport instead.</p>
    </div>
  </StudentShell>;
}
