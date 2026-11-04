import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
import { courseInfo, courseOutline } from "@/modules/academics/course-outline";
import { courseStages, estimatedCourseMinutes, getModuleGuide } from "@/modules/academics/course-guide";
import styles from "@/components/course-journey.module.css";

export default function Course() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="section catalog-page">
        <Link className="back" href="/catalog">← Academic catalog</Link>
        <p className="eyebrow">CS101 · COMPUTER SCIENCE FOUNDATIONS</p>
        <h1>Learn Python. Build the thinking behind it.</h1>
        <p className="lead">From computational thinking to an independently reviewed Personal Study Planner, this beginner-friendly pathway teaches core computing concepts through one connected project.</p>
        <div className="actions">
          <Link className="button" href="/preview/learn/cs101/computational-thinking">Start learning CS101 <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="text-link" href="/preview/learn/cs101">Open guided syllabus <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <p className="notice">CS101 is a ten-module pilot course. Local preview exercises are formative and remain on the device; official evidence and any course award require an enrolled account and eligibility review. KHANIVERSITY does not award accredited degrees.</p>
        <section className={styles.journey} aria-label="CS101 overview">
          <div className={styles.sectionHead}>
            <p className="eyebrow">ACADEMIC OVERVIEW</p>
            <h2>What you will learn</h2>
          </div>
          <div className={styles.steps}>
            <div className={styles.stage}>
              <div className={styles.stageHeader}><BookOpen size={20} aria-hidden="true" /><div><h3>{courseOutline.length} modules</h3><p>Understand, practice and check mastery across four connected stages.</p></div></div>
            </div>
            <div className={styles.stage}>
              <div className={styles.stageHeader}><Clock3 size={20} aria-hidden="true" /><div><h3>About {Math.round(estimatedCourseMinutes / 60)} guided hours</h3><p>Planning estimate only. Study at your own pace; time is not a grading requirement.</p></div></div>
            </div>
          </div>
        </section>
        <h2>Complete CS101 pathway</h2>
        <p className="lead">Four stages, ten lessons and the same Personal Study Planner throughout. Explore a stage to see outcomes, practice focus and the modules it contains.</p>
        <div className={styles.syllabus} id="cs101-syllabus">
          {courseStages.map((stage) => (
            <section className={styles.stage} key={stage.id} id={`stage-${stage.id}`} aria-label={stage.title}>
              <div className={styles.stageHeader}>
                <span className={styles.stageNumber}>{stage.label}</span>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.summary}</p>
                  <small><strong>Learning outcome:</strong> {stage.outcome}</small>
                </div>
              </div>
              <ol className={styles.moduleList}>
                {stage.modules.map((module) => {
                  const guide = getModuleGuide(module.id);
                  if (!guide) return null;
                  return (
                    <li key={module.id}>
                      <Link href={`/preview/learn/cs101/${module.id}`}>
                        <span className={styles.moduleIndex}>{String(guide.index + 1).padStart(2, "0")}</span>
                        <span className={styles.moduleCopy}>
                          <strong>{module.title}</strong>
                          <small>{module.outcome}</small>
                          <small className={styles.moduleMeta}>Approximately {guide.studyMinutes} minutes · {guide.prerequisite ? "Builds on the previous module" : "No prior programming required"}</small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
        <section className={styles.expectations} aria-label="Course completion requirements">
          <div>
            <h2>Assessment and academic evidence</h2>
            <p>Module checks support learning and can be retried; the existing mastery threshold is 80%. The capstone has a separate authorized human-review requirement. Completion is not determined by study time, browser-only exercise results or AI tutor output.</p>
            <Link className="text-link" href="/preview/learn/cs101">View the complete guided syllabus <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>
        <p className="fine-print">{courseInfo.title} · School of Computer Science · Pilot syllabus version {courseInfo.version}. Detailed lesson publication and assessment approval remain subject to academic review.</p>
      </main>
      <Footer />
    </>
  );
}
