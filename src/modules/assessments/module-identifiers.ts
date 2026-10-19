// Lesson URL slugs are not the same identifiers as the database's module keys.
// Assessment RPCs require public.modules.id, not the learner-facing route slug.
// Keep this mapping aligned with the seeded university curriculum.
export const assessmentModuleIds = {
  "programming-fundamentals": "cs101-02",
  "variables-data-input-output": "cs101-03",
  "conditions-loops": "cs101-04",
  "functions-scope": "cs101-05",
  "collections": "cs101-06",
  "files-exceptions-debugging": "cs101-07",
  "algorithms-complexity": "cs101-08",
  "testing-git-quality": "cs101-09",
  "personal-study-planner-capstone": "cs101-10",
} as const;

export function assessmentModuleId(lessonSlug: string): string | null {
  return Object.prototype.hasOwnProperty.call(assessmentModuleIds, lessonSlug)
    ? assessmentModuleIds[lessonSlug as keyof typeof assessmentModuleIds]
    : null;
}
