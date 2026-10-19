import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader, Footer } from "@/components/brand";
import styles from "../platforms/platforms.module.css";

export const metadata: Metadata = {
  title: "Learn, Code and Earn Evidence | KHANIVERSITY",
  description: "Launch the real KHANIVERSITY learning workflow: course catalog, enrollment, lessons, CodeLab, student evidence and academic review.",
};

const journeys = [
  { step: "01", title: "Choose your course", description: "Inspect published courses, prerequisites and the complete CS101 syllabus.", href: "/catalog", action: "Browse published courses" },
  { step: "02", title: "Enroll with your account", description: "Sign in to save course enrollment, progress and academic evidence under your identity.", href: "/signin", action: "Sign in or create an account" },
  { step: "03", title: "Study the lessons", description: "Read CS101 modules, practice concepts and submit protected learning checks.", href: "/dashboard", action: "Enter StudentOS" },
  { step: "04", title: "Write and submit Python", description: "Run code in the browser, test an exercise and send a submission for staff review.", href: "/codelab", action: "Launch CodeLab" },
  { step: "05", title: "Review your evidence", description: "Track course progress, assessment history, submitted work and verified learning evidence.", href: "/passport", action: "Open Skills Passport" },
  { step: "06", title: "Manage academic operations", description: "Assigned academic staff can review submissions, approve teaching materials and audit decisions.", href: "/admin", action: "Open restricted staff console" },
] as const;

export default function PlatformsPage() {
  return <>
    <PublicHeader />
    <main id="main" className={styles.wrap}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>KHANIVERSITY · START YOUR LEARNING JOURNEY</span>
        <h1>Learn it. Build it.<br />Show your work.</h1>
        <p>Start with the Computer Science Academy. Explore real courses, complete lessons, practise Python and build a record of your work. Your account connects your learning across the campus.</p>
        <div className={styles.links}>
          <Link className={styles.primary} href="/catalog/cs101">Start with Computer Science →</Link>
          <Link className={styles.secondary} href="/preview/dashboard">Try without an account</Link>
        </div>
      </header>
      <section aria-labelledby="journey-title">
        <div className={styles.sectionHead}><div><h2 id="journey-title">Your campus, from first lesson to reviewed work</h2><p>Choose a task below to open the actual application. There are no blueprint diagrams or feature promises standing in for a workflow.</p></div></div>
        <div className={styles.cards}>
          {journeys.map(journey=><article className={styles.card} key={journey.step}>
            <span className={styles.num}>STEP {journey.step}</span>
            <h3>{journey.title}</h3>
            <p className={styles.desc}>{journey.description}</p>
            <div className={styles.links}><Link className={styles.primary} href={journey.href}>{journey.action} →</Link></div>
          </article>)}
        </div>
      </section>
      <section className={styles.architecture} aria-labelledby="next-title">
        <span className={styles.eyebrow}>COMPUTER SCIENCE · FIRST ACADEMY</span>
        <h2 id="next-title">Your first course is ready to explore</h2>
        <p>CS101 contains ten authored modules and Python practice. Account-backed assessment, enrollment, staff review and progress depend on an active connected Supabase environment. The no-account preview stores evidence only in your browser.</p>
        <div className={styles.links}>
          <Link className={styles.primary} href="/catalog/cs101">Explore CS101 →</Link>
          <Link className={styles.secondary} href="/admissions">How enrollment works</Link>
        </div>
        <p className={styles.note}>KHANIVERSITY is an independent online learning academy, not an accredited university or degree-awarding institution.</p>
      </section>
    </main>
    <Footer />
  </>;
}
