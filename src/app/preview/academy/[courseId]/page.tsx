import { notFound } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { UniversityCoursePreview } from "@/components/university-course";
import { getCourse } from "@/modules/academics/university";

export default async function SchoolCoursePreview({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course || course.id === "cs101") notFound();
  return (
    <StudentShell preview active="lesson">
      <UniversityCoursePreview course={course} />
    </StudentShell>
  );
}
