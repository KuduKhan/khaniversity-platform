// Curriculum publication data comes from authenticated server reads.
// The register is a staff-facing read-only operational overview.
export type RegisteredModule = { id: string; title: string };
export type RegisteredLesson = {
  id: string;
  module_id: string;
  title: string;
  published: boolean;
  content_version: string;
};

export function buildCurriculumRegister(
  modules: readonly RegisteredModule[],
  lessons: readonly RegisteredLesson[],
) {
  const lessonsByModule = new Map(lessons.map(item => [item.module_id, item]));
  const entries = modules.map(item => {
    const lesson = lessonsByModule.get(item.id);
    return {
      id: item.id,
      title: item.title,
      lessonTitle: lesson?.title ?? "Lesson not yet published",
      version: lesson?.content_version ?? "—",
      published: lesson?.published ?? false,
      hasLesson: Boolean(lesson),
    };
  });
  return {
    entries,
    publishedCount: entries.filter(item => item.published).length,
    draftCount: entries.filter(item => !item.published).length,
  };
}
