import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader, Footer } from "@/components/brand";
import { dataDomains } from "@/modules/platforms/data-domains";
import { platformSurfaces } from "@/modules/platforms/catalog";
import styles from "./platforms.module.css";

export const metadata: Metadata = {
  title: "Five Connected Platforms | KHANIVERSITY",
  description: "Explore the public academy, StudentOS, Learning Studio, Python CodeLab, and staff-governed Academic Administration.",
};

export default function PlatformsPage() {
  return <>
    <PublicHeader />
    <main id="main" className={styles.wrap}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>KHANIVERSITY · THE CONNECTED CAMPUS</span>
        <h1>Five platforms.<br />One learning journey.</h1>
        <p>Discover, enroll, learn, build and demonstrate progress through a connected academic experience. Each platform has a distinct purpose, while identity, curricula and authoritative results remain shared.</p>
        <div className={styles.meta}>
          <span>ONE MODULAR MONOLITH</span>
          <span>COMPUTER SCIENCE FIRST</span>
          <span>RESPONSIVE WEB + PWA</span>
        </div>
      </div>
      <div className={styles.sectionHead}>
        <div><h2>Explore your campus</h2><p>Choose an entry point. Public previews require no account; verified university records and academic operations require the appropriate identity and permissions.</p></div>
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
      <section className={styles.architecture} aria-labelledby="domain-title">
        <span className={styles.eyebrow}>MASTER BLUEPRINT V1.0 · SECTION 07</span>
        <h2 id="domain-title">One shared academic data foundation</h2>
        <p>The nine blueprint data domains support all five platforms. The foundation already contains key account, catalog, progress, assessment, review, and audit tables; additional domain-specific tables remain planned and have not been deployed.</p>
        <ul className={styles.domains}>{dataDomains.map(domain => <li key={domain.domain}>
          <span>{domain.domain}</span><small>{domain.planned.length ? "Extended schema planned" : "Foundation present"}</small>
        </li>)}</ul>
        <p>Learning achievements are formative unless authorized assessments and human review satisfy the published course requirements. KHANIVERSITY does not offer accredited degrees.</p>
      </section>
    </main>
    <Footer />
  </>;
}
