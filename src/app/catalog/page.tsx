import Link from "next/link";
import { ArrowRight, BookOpen, Network, Shield, BrainCircuit, Cloud, Cpu } from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
import { schools, courseListings } from "@/modules/academics/university";

const icons = [BookOpen, Network, BrainCircuit, Shield, Cloud, Cpu];

export default function Catalog() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="section catalog-page">
        <p className="eyebrow">KHANIVERSITY · ACADEMIC CATALOG</p>
        <h1>One university.<br />Six specialist schools.</h1>
        <p className="lead">
          Shared learning systems connect foundations, practical work and
          professional projects across computing disciplines.
        </p>
        <div className="university-catalog">
          {schools.map((school, index) => {
            const Icon = icons[index];
            const availableCourses = courseListings.filter((course) => course.schoolId === school.id);
            return (
              <Link className="university-school-card" href={`/schools/${school.id}`} key={school.id}>
                <div className="school-card-heading">
                  <span className="school-icon"><Icon size={23} /></span>
                  <span className="tag">{school.programs.length} PROGRAMS</span>
                </div>
                <h2>{school.title}</h2>
                <p>{school.introduction}</p>
                <div className="school-card-meta">
                  <span>{availableCourses.length} course pathways</span>
                  <span>{school.focus}</span>
                </div>
                <span className="text-link">Explore school <ArrowRight size={16} /></span>
              </Link>
            );
          })}
        </div>
        <section className="catalog-progression">
          <p className="eyebrow">ACADEMIC PROGRESSION</p>
          <h2>From first principles to professional practice.</h2>
          <div><span>Foundation</span><i /><span>Intermediate</span><i /><span>Advanced</span><i /><span>Professional projects</span></div>
          <p>Programs share the same catalog, identity and learning record. Progress depends on demonstrated mastery, not time spent watching content.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
