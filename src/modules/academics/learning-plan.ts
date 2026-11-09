import { courseOutline } from "./course-outline";

export type ProgressForPlan = {
  completed: boolean;
  score: number | null;
  moduleProgress?: Record<string, { score: number; completedAt: string }>;
};

export type ModuleMasteryState = "not-started" | "needs-review" | "mastered";

/** One authoritative interpretation of module evidence across StudentOS and syllabus. */
export function moduleScore(progress: ProgressForPlan, moduleId: string): number | null {
  const raw = moduleId === courseOutline[0].id
    ? progress.score
    : progress.moduleProgress?.[moduleId]?.score;
  return typeof raw === "number" && Number.isFinite(raw) && raw >= 0 && raw <= 100
    ? raw
    : null;
}

export function moduleMastery(score: number | null): ModuleMasteryState {
  return score === null ? "not-started" : score >= 80 ? "mastered" : "needs-review";
}

export function buildLearningPlan(progress: ProgressForPlan) {
  const checkpoints = courseOutline.map((lesson) => {
    const score = moduleScore(progress, lesson.id);
    return {
      id: lesson.id,
      title: lesson.title,
      isCapstone: Boolean(lesson.project),
      score,
      status: moduleMastery(score),
    };
  });

  const mastered = checkpoints.filter((checkpoint) => checkpoint.status === "mastered").length;
  const unfinished = checkpoints.find((checkpoint) => checkpoint.status !== "mastered");
  const next = unfinished ?? checkpoints[checkpoints.length - 1];
  const review = checkpoints.filter((checkpoint) => checkpoint.status === "needs-review");
  const hasFinishedChecks = mastered === checkpoints.length;
  const nextHref = `/learn/cs101/${next.id}`;
  const nextAction = {
    href: nextHref,
    kind: hasFinishedChecks ? "capstone-review" : next.status === "needs-review" ? "retry" : "learn",
    heading: hasFinishedChecks
      ? "Prepare your capstone review"
      : next.status === "needs-review"
        ? "Build confidence with a focused retry"
        : "Continue where you left off",
    label: hasFinishedChecks
      ? "Review your capstone"
      : next.status === "needs-review"
        ? "Review and retry this module"
        : "Continue learning",
  } as const;

  return {
    checkpoints,
    mastered,
    total: checkpoints.length,
    percentage: Math.round((100 * mastered) / checkpoints.length),
    next,
    nextHref,
    nextAction,
    review,
    hasFinishedChecks,
    // Passing all formative checks alone never issues a qualification.
    // Award eligibility and capstone review are verified by protected services.
  };
}
