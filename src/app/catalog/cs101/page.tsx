import Link from "next/link";
import { PublicHeader, Footer } from "@/components/brand";
import { courseModules } from "@/modules/academics/curriculum";
const lessonPath = [
  "computational-thinking",
  ...courseModules.slice(1).map((module) => module.id),
];
export default function Course() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="section catalog-page">
        <Link className="back" href="/catalog">
          ← Academic catalog
        </Link>
        <p className="eyebrow">CS101 / COMPUTER SCIENCE FOUNDATIONS</p>
        <h1>
          Big ideas.
          <br />
          Practical beginnings.
        </h1>
        <p className="lead">
          Introduction to Computer Science & Python. Learn to reason about
          problems, describe solutions, and eventually build a Personal Study
          Planner.
        </p>
        <div className="actions">
          <Link className="button" href="/preview/learn/cs101/computational-thinking">
            Start learning CS101 →
          </Link>
          <Link className="text-link" href="/preview/learn/cs101/personal-study-planner-capstone">
            Start the Personal Study Planner capstone ↗
          </Link>
        </div>
        <p className="notice">
          Ten connected modules combine lessons, practical coding, formative
          checks and a Personal Study Planner capstone. Preview progress stays
          on this device; connected course records require a student account.
        </p>
        <h2>Complete CS101 pathway</h2>
        <div className="roadmap">
          {courseModules.map((module, i) => (
            <Link className="roadmap-module" key={module.id} href={`/preview/learn/cs101/${lessonPath[i]}`}>
              <span className="module-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <span className="tag">OPEN MODULE →</span>
            </Link>
          ))}
        </div>
        <p className="fine-print">Formative lesson checks support learning and can be retried. The capstone review is a separate requirement for course completion; this learning platform does not award an accredited degree.</p>
      </main>
      <Footer />
    </>
  );
}
