import { buildCurriculumRegister, type RegisteredLesson, type RegisteredModule } from "@/modules/platforms/curriculum-register";
import styles from "./curriculum-register.module.css";

export function CurriculumRegister({
  modules, lessons,
}: { modules: RegisteredModule[]; lessons: RegisteredLesson[] }) {
  const summary = buildCurriculumRegister(modules, lessons);
  return <section aria-labelledby="curriculum-register" className={styles.section}>
    <span className="eyebrow">ACADEMIC PLATFORM · CURRICULUM GOVERNANCE</span>
    <h2 id="curriculum-register">CS101 publication register</h2>
    <p className={styles.intro}>A database-backed register of the versioned core CS101 lesson records. Instructors can now propose additional teaching material in the faculty workspace above; reviewers independently approve it before enrolled students can read it.</p>
    <div className={styles.stats}>
      <div><strong>{summary.entries.length}</strong><span>Registered modules</span></div>
      <div><strong>{summary.publishedCount}</strong><span>Published lessons</span></div>
      <div><strong>{summary.draftCount}</strong><span>Awaiting publication</span></div>
    </div>
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption>Current database publication records for Computer Science Foundations</caption>
        <thead><tr><th scope="col">Module</th><th scope="col">Lesson</th><th scope="col">Content version</th><th scope="col">Status</th></tr></thead>
        <tbody>
          {summary.entries.map(item => <tr key={item.id}>
            <th scope="row"><small>{item.id}</small><br />{item.title}</th>
            <td>{item.lessonTitle}</td>
            <td><code>{item.version}</code></td>
            <td><span className={item.published ? styles.published : styles.draft}>{item.published ? "Published" : "Draft / missing"}</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className={styles.footnote}>Core assessment versions remain fixed and protected. Faculty supplements follow a separate, audited approval workflow and never change historical grades or hidden answer keys.</p>
  </section>;
}
