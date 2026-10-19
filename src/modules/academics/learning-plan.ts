import { courseModules } from "./curriculum";

export type ProgressForPlan = {
  completed: boolean;
  score: number | null;
  moduleProgress?: Record<string, { score: number; completedAt: string }>;
};

export function buildLearningPlan(progress: ProgressForPlan) {
  const checkpoints = courseModules.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    isCapstone: Boolean(lesson.project),
    score: index === 0 ? progress.score : progress.moduleProgress?.[lesson.id]?.score ?? null,
  }));
  const mastered = checkpoints.filter((checkpoint) => checkpoint.score !== null && checkpoint.score >= 80).length;
  const unfinished = checkpoints.find((checkpoint) => checkpoint.score === null || checkpoint.score < 80);
  const next = unfinished ?? checkpoints[checkpoints.length - 1];
  const review = checkpoints.filter((checkpoint) => checkpoint.score !== null && checkpoint.score < 80);
  return {
    mastered,
    total: checkpoints.length,
    percentage: Math.round((100 * mastered) / checkpoints.length),
    next,
    nextHref: `/learn/cs101/${next.id}`,
    review,
    hasFinishedChecks: mastered === checkpoints.length,
    // Assessment mastery is not an issued credential; capstone requires staff review.
  };
}
