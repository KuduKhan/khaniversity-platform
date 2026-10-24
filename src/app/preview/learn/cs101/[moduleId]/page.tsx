import { notFound } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { CourseModule } from "@/components/course-module";
import { getCourseModule } from "@/modules/academics/curriculum";

export default async function PreviewCourseModule({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const courseModule = getCourseModule(moduleId);
  if (!courseModule || moduleId === "computational-thinking") notFound();
  return (
    <StudentShell preview active="lesson">
      <CourseModule module={courseModule} preview scope="preview" />
    </StudentShell>
  );
}
