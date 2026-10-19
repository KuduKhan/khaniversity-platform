import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader, Footer } from "@/components/brand";
import { platformSurfaces } from "@/modules/platforms/catalog";
import styles from "./platforms.module.css";

export const metadata: Metadata = {
  title: "Start Learning, Submit Code, and Manage Courses | KHANIVERSITY",
  description: "Explore the public academy, StudentOS, Learning Studio, Python CodeLab, and staff-governed Academic Administration.",
};

export default function PlatformsPage() {
  return <>
    <PublicHeader />
    <main id="main" className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>KHANIVERSITY · THE CONNECTED CAMPUS</span>
        <h1>Your academy.<br />Ready for real work.</h1>
        <p>Explore the catalog, enroll in CS101, work through graded module checks, write and submit Python code, and review learning evidence. Qualified academic staff can govern teaching material, review submissions and manage course access.</p>
        <div className={styles.meta}>
          <span>ONE MODULAR MONOLITH</span>
          <span>COMPUTER SCIENCE FIRST</span>
          <span>RESPONSIVE WEB + PWA</span>
        </div>
      </div>
      <div className={styles.sectionHead}>
        <div><h2>Open a working workspace</h2><p>Each link opens a learning or academic tool. Account-backed records require sign-in and enrollment; a local preview is available without them.</p></div>
      </div>
      <div className={styles.cards}>
        {platformSurfaces.map((surface) => <article className={styles.card} key={surface.id}>
          <div className={styles.cardHead}>
            <span className={styles.num}>PLATFORM {surface.number}</span>
            <span className={styles.access}>{surface.access === "staff-only" ? "Staff-restricted" : surface.access === "public" ? "Public" : "Preview + account"}</span>
          </div>
          <span className={styles.subtitle}>{surface.eyebrow}</span>
          <h3>{surface.title}</h3>
          <p className={styles.desc}>{surface.description}</p>
          <ul className={styles.highlights}>{surface.highlights.map(value => <li key={value}>{value}</li>)}</ul>
          <div className={styles.links}>
            <Link className={styles.primary} href={surface.primaryHref}>{surface.primaryLabel} →</Link>
            <Link className={styles.secondary} href={surface.secondaryHref}>{surface.secondaryLabel}</Link>
          </div>
          <p className={styles.note}>{surface.note}</p>
        </article>)}
      </div>
      <section className={styles.architecture} aria-labelledby="workflow-title">
        <span className={styles.eyebrow}>GET TO WORK · REAL LEARNING EXPERIENCES</span>
        <h2 id="workflow-title">Move from a lesson to demonstrable skill</h2>
        <p>These are CS101 entry points, not planned platform diagrams. A verified student account stores assessment results; staff-review decisions remain separate from browser practice checks.</p>
        <div className={styles.links}>
          <Link className={styles.primary} href="/dashboard">Open enrolled StudentOS →</Link>
          <Link className={styles.primary} href="/codelab">Submit Python solution →</Link>
          <Link className={styles.primary} href="/passport">View account-backed evidence →</Link>
          <Link className={styles.secondary} href="/admin">Academic staff console →</Link>
        </div>
        <p className={styles.note}>Learning achievements are internal to KHANIVERSITY; this independent academy does not issue accredited university degrees. Staff actions require administrator-assigned course roles.</p>
      </section>
    </main>
    <Footer />
  </>;
}
