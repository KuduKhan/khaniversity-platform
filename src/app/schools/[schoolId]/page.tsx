import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
import { courseListings, getSchool } from "@/modules/academics/university";

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const school = getSchool(schoolId);
  if (!school) notFound();
  return (
    <>
      <PublicHeader />
      <main id="main" className="section catalog-page school-page">
        <Link className="back" href="/catalog"><ArrowLeft size={15} /> Academic catalog</Link>
        <p className="eyebrow">KHANIVERSITY · SPECIALIST SCHOOL</p>
        <h1>{school.title}</h1>
        <p className="lead">{school.introduction}</p>
        <div className="school-focus"><GraduationCap size={19} /><span><strong>Academic focus</strong>{school.focus}</span></div>
        <h2>Programs and courses</h2>
        <div className="school-programs">
          {school.programs.map((program) => (
            <section className="school-program" id={program.id} key={program.id}>
              <p className="eyebrow">PROGRAM</p>
              <h3>{program.title}</h3>
              <div className="school-courses">
                {program.courses.map((id) => {
                  const course = courseListings.find((entry) => entry.id === id);
                  if (!course) return null;
                  return (
                    <Link className="school-course" href={`/catalog/${course.id}`} key={course.id}>
                      <span className="tag">{course.id.toUpperCase()} · {course.level.toUpperCase()}</span>
                      <h4>{course.title}</h4>
                      <p>{course.description}</p>
                      <span className="text-link">Explore course <ArrowRight size={16} /></span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <p className="fine-print">Schools share one academic platform and common student services. Course preview evidence is for learning and is not a verified credential or accredited qualification.</p>
      </main>
      <Footer />
    </>
  );
}
