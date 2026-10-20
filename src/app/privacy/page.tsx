import Link from "next/link";
import { PublicHeader, Footer } from "@/components/brand";

export const metadata = {
  title: "Learning data and privacy | KHANIVERSITY",
  description: "An overview of KHANIVERSITY student learning data and local preview boundaries.",
};

export default function PrivacyPage() {
  return <>
    <PublicHeader />
    <main id="main" className="section catalog-page">
      <p className="eyebrow">STUDENT RIGHTS · RELEASE 0.3</p>
      <h1>Your learning data matters.</h1>
      <p className="lead">This page describes the platform&apos;s current data flows. It is an engineering disclosure, not a substitute for a finalized legal privacy notice or institutional data-governance policy.</p>
      <section className="module-reading">
        <h2>Learning without an account</h2>
        <p>The public preview stores lesson results, diagnostics, Python challenge outcomes, and lab records in this browser&apos;s local storage. They do not represent verified university credentials and are not automatically synced to a student account. Clearing browser data may erase them.</p>
      </section>
      <section className="module-reading">
        <h2>Signed-in academic records</h2>
        <p>Supabase stores account identity, course enrollment, formative assessment results, optional drafts, and any cohort participation or academic awards. Student records use database access policies; authorized course staff can access selected educational workflows. Exported JSON files are editable and do not independently prove achievement.</p>
      </section>
      <section className="module-reading">
        <h2>Academic pilot reporting</h2>
        <p>Authorized course staff can view aggregated enrollment, lesson activation, module mastery and review workload statistics for the CS101 pilot. These totals are calculated from account-backed learning records protected by server authorization and database row-level security. The dashboard does not publish individual student profiles or grades. The metrics are educational operational evidence, not a public ranking or a claim of verified graduation.</p>
      </section>
      <section className="module-reading">
        <h2>AI Professor and CodeLab</h2>
        <p>If configured, typed AI Professor questions are sent to the selected external AI provider for a response. The platform does not currently persist tutor chat history, but the provider&apos;s own terms and processing policies may apply. CodeLab executes Python in your browser; exporting code requires an explicit action. Do not enter secrets or sensitive personal records into either tool.</p>
      </section>
      <section className="module-reading">
        <h2>Credential verification</h2>
        <p>An issued course award can be checked using its reference code. A valid code may reveal the recipient&apos;s certificate name, course title, award status, date and evidence summary. The awards are not accredited degrees.</p>
      </section>
      <section className="module-reading">
        <h2>Before the public learner pilot</h2>
        <p>KHANIVERSITY must finalize a named data controller/contact channel, lawful processing basis, retention schedule, student record correction and deletion procedures, backup and incident-response policy, and external-provider disclosures. No unspecified deletion or retention promise is made here.</p>
      </section>
      <Link className="text-link" href="/catalog/cs101">Return to CS101 →</Link>
    </main>
    <Footer />
  </>;
}
