import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader, Footer } from "@/components/brand";
import styles from "../platforms/platforms.module.css";
export const metadata: Metadata = {
  title: "Getting Started & Admissions | KHANIVERSITY",
  description: "Explore the CS101 pilot, entry steps and learning commitments at KHANIVERSITY.",
};
const steps = [
  { title:"Explore CS101", body:"Review the ten-module Computer Science Foundations pathway, prerequisites, and capstone expectations.", href:"/catalog/cs101", link:"View the full CS101 pathway" },
  { title:"Try the learning preview", body:"Study, practice Python and experience the campus on your device before creating an account.", href:"/preview/dashboard", link:"Try the Student Portal" },
  { title:"Create a student account", body:"When registration is available, sign up with an email, confirm your address and enroll in the CS101 course.", href:"/signin", link:"Student account sign-in" },
  { title:"Master, build and review", body:"Pass the authored checks, complete a project draft and request academic review. Local preview scores do not count as university-issued awards.", href:"/platforms", link:"See the five learning platforms" },
];
export default function AdmissionsPage() {
  return <>
    <PublicHeader />
    <main id="main" className={styles.wrap}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>KHANIVERSITY · STUDENT ENTRY</span>
        <h1>Your first step toward computer science.</h1>
        <p>Begin with Computer Science Foundations. We prioritize a clear route from first concepts to real Python practice and reviewed academic evidence.</p>
        <div className={styles.meta}><span>BEGINNER-FRIENDLY</span><span>SELF-PACED</span><span>CONTROLLED PILOT</span></div>
      </header>
      <section aria-labelledby="admissions-title">
        <div className={styles.sectionHead}><div><h2 id="admissions-title">How to begin</h2><p>Enrollment availability and confirmation emails depend on live account configuration. This is a guide to the first course, not an offer of regulated university admission.</p></div></div>
        <div className={styles.cards}>{steps.map((step,index)=><article key={step.title} className={styles.card}>
          <span className={styles.num}>STEP {String(index+1).padStart(2,"0")}</span>
          <h3>{step.title}</h3><p className={styles.desc}>{step.body}</p>
          <div className={styles.links}><Link className={styles.primary} href={step.href}>{step.link} →</Link></div>
        </article>)}</div>
      </section>
      <section className={styles.architecture}>
        <h2>Academic status and learner information</h2>
        <p>KHANIVERSITY is an independent online learning academy, not an accredited degree-awarding university. Pilot entry does not imply admission to a regulated university program. No paid application or eligibility guarantee is offered here.</p>
        <Link className={styles.secondary} href="/privacy">Read the learning-data disclosure</Link>
      </section>
    </main>
    <Footer />
  </>;
}
