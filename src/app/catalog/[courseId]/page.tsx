import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, GraduationCap } from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";
import { courseListings, getCourse, getSchool } from "@/modules/academics/university";

export default async function CatalogCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  const school = getSchool(course.schoolId);
  const courses = courseListings.filter((item) => item.schoolId === course.schoolId);
  const previewHref = course.id === "cs101"
    ? "/preview/learn/cs101/computational-thinking"
    : `/preview/academy/${course.id}`;
  return (
    <>
      <PublicHeader />
      <main id="main" className="section catalog-page">
        <Link className="back" href={`/schools/${course.schoolId}`}><ArrowRight size={15} /> {school?.title}</Link>
        <p className="eyebrow">{school?.title.toUpperCase()} · {course.id.toUpperCase()}</p>
        <h1>{course.title}</h1>
        <p className="lead">{course.description}</p>
        <div className="course-meta-strip"><span><GraduationCap size={17} /> {course.level} pathway</span><span><BookOpen size={17} /> Practical learning</span><span><Check size={17} /> Mastery-oriented</span></div>
        <section className="course-start-panel">
          <div><p className="eyebrow">LEARNING STUDIO</p><h2>Start with a focused learning experience.</h2><p>{course.id === "cs101" ? "Open the complete ten-module CS101 pathway, with Python practice, formative checks and a capstone project." : "Explore a guided school sampler with a worked concept, an applied scenario, a professional project brief and a formative check."}</p></div>
          <Link className="button gold" href={previewHref}>{course.id === "cs101" ? "Start CS101" : "Open course sampler"} <ArrowRight size={17} /></Link>
        </section>
        {course.id === "cs101" && <section className="related-courses"><h2>Continue exploring Computer Science</h2>{courses.filter((item) => item.id !== course.id).map((item) => <Link href={`/catalog/${item.id}`} key={item.id}>{item.title}<ArrowRight size={15} /></Link>)}</section>}
        <p className="fine-print">Learning samplers and local preview records do not represent accredited course completion. Connected student records require the configured student account service.</p>
      </main>
      <Footer />
    </>
  );
}
