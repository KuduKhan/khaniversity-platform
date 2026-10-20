import { Activity, BookOpenCheck, Clock3, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";
import type { PilotSummary } from "@/modules/operations/pilot-metrics";
import { pilotQueueCount, pilotRate } from "@/modules/operations/pilot-metrics";
import styles from "./pilot-command-center.module.css";

export function PilotCommandCenter({ metrics }: { metrics: PilotSummary }) {
  const activation = pilotRate(metrics.startedFirstLesson,metrics.enrolled);
  const completion = pilotRate(metrics.completionEligible,metrics.enrolled);
  const figures = [
    { label: "Enrolled students", value: String(metrics.enrolled), detail: `${metrics.enrolledLast7Days} joined in the past 7 days`, Icon: UsersRound },
    { label: "First-lesson activation", value: activation === null ? "—" : `${activation}%`, detail: `${metrics.startedFirstLesson} of ${metrics.enrolled} · 70% pilot hypothesis`, Icon: BookOpenCheck },
    { label: "Completion eligible", value: completion === null ? "—" : `${completion}%`, detail: `${metrics.completionEligible} of ${metrics.enrolled} · 40% pilot hypothesis`, Icon: GraduationCap },
    { label: "Work awaiting review", value: String(pilotQueueCount(metrics)), detail: `${metrics.overdueReviews} code/capstone items older than 72h`, Icon: Clock3 },
  ];
  return <section className={styles.wrap} aria-labelledby="pilot-title">
    <header className={styles.hero}>
      <div><span className={styles.eyebrow}>KHANIVERSITY · ADMINOS 0.3</span>
      <h1 id="pilot-title">Pilot command center</h1>
      <p>Operational evidence from enrolled CS101 learners—not preview activity, estimates or generated demonstration records.</p></div>
      <div className={styles.updated}><Activity size={16} aria-hidden="true"/> As of {new Date(metrics.collectedAt).toLocaleString("en-GB",{timeZone:"UTC"})} UTC</div>
    </header>
    <div className={styles.metrics}>
      {figures.map(({label,value,detail,Icon})=><article key={label} className={styles.metric}>
        <div className={styles.label}><span>{label}</span><Icon size={19} aria-hidden="true"/></div>
        <strong>{value}</strong><small>{detail}</small>
      </article>)}
    </div>
    <div className={styles.columns}>
      <section className={styles.panel} aria-labelledby="module-mastery">
        <span className={styles.eyebrow}>ACADEMIC PROGRESSION</span>
        <h2 id="module-mastery">Mastery by module</h2>
        <p>Students mastering the currently published lesson version in each CS101 module.</p>
        <ol className={styles.modules}>{metrics.moduleMastery.map((m,i)=>{
          const percent = metrics.enrolled ? Math.min(100,m.mastered/metrics.enrolled*100) : 0;
          return <li key={m.id}>
            <div className={styles.moduleLabel}><span><em>{String(i+1).padStart(2,"0")}</em>{m.title}</span><b>{m.mastered} / {metrics.enrolled}</b></div>
            <div className={styles.track} role="img" aria-label={`${m.title}: ${m.mastered} of ${metrics.enrolled} learners mastered`}>
              <span style={{width:`${percent}%`}}/>
            </div>
          </li>;
        })}</ol>
        <p className={styles.footnote}>{metrics.allModulesMastered} learners have mastered all 10 modules. Formal completion also requires accepted CodeLab and capstone work.</p>
      </section>
      <div className={styles.side}>
        <section className={styles.panel} aria-labelledby="review-workload">
          <span className={styles.eyebrow}>FACULTY WORKLOAD</span><h2 id="review-workload">Review backlog</h2>
          <div className={styles.queue}><span>CodeLab submissions</span><strong>{metrics.pendingCode}</strong></div>
          <div className={styles.queue}><span>Capstone submissions</span><strong>{metrics.pendingCapstones}</strong></div>
          <div className={styles.queue}><span>Curriculum proposals</span><strong>{metrics.pendingCurriculum}</strong></div>
          <p className={styles.footnote}>Counts include the entire authorized queue. Itemized review panels below may show only recent records.</p>
        </section>
        <section className={styles.panel} aria-labelledby="academic-gates">
          <span className={styles.eyebrow}>ACADEMIC INTEGRITY</span><h2 id="academic-gates">Evidence review</h2>
          <div className={styles.coverage}><ShieldCheck size={20} aria-hidden="true"/><div>
            <strong>{metrics.approvedCode} learners with accepted CodeLab work</strong>
            <p>Independent code review recorded in the database.</p>
          </div></div>
          <div className={styles.coverage}><GraduationCap size={20} aria-hidden="true"/><div>
            <strong>{metrics.approvedCapstones} learners with accepted capstones</strong>
            <p>Signed-off rubric results linked to submitted snapshots.</p>
          </div></div>
          <p className={styles.footnote}>Staff roles, MFA, email delivery and real two-user security checks require separate verification before opening public enrollment.</p>
        </section>
      </div>
    </div>
  </section>;
}
