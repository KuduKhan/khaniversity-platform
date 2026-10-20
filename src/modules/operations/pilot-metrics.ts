// Derived operational evidence for a real, RLS-scoped CS101 cohort.
// Never mix local preview records or invented demonstration data into AdminOS.
export type Enrollment = { user_id: string; enrolled_at: string };
export type Progress = { user_id: string; lesson_id: string; content_version: string; completed: boolean };
export type CourseModule = { id: string; title: string; position: number };
export type PublishedLesson = { id: string; module_id: string; content_version: string; published: boolean };
export type CodeReview = { user_id: string; status: string; code_tests_passed: boolean; submitted_at: string };
export type CapstoneSubmission = { id: string; user_id: string; status: string; submitted_at: string };
export type CapstoneReview = { user_id: string; submission_id: string | null; score: number; code_tests_passed: boolean };
export type LessonRevision = { status: string };

export type PilotInput = {
  enrollments: Enrollment[];
  progress: Progress[];
  modules: CourseModule[];
  lessons: PublishedLesson[];
  code: CodeReview[];
  capstones: CapstoneSubmission[];
  reviews: CapstoneReview[];
  revisions: LessonRevision[];
};
export type PilotModule = { id: string; title: string; mastered: number };
export type PilotSummary = {
  collectedAt: string;
  enrolled: number;
  enrolledLast7Days: number;
  startedFirstLesson: number;
  masteredFirstLesson: number;
  allModulesMastered: number;
  completionEligible: number;
  approvedCapstones: number;
  approvedCode: number;
  pendingCode: number;
  pendingCapstones: number;
  pendingCurriculum: number;
  overdueReviews: number;
  moduleMastery: PilotModule[];
};

export function pilotRate(numerator: number, denominator: number): number | null {
  return denominator > 0 ? Math.round(numerator / denominator * 100) : null;
}
export function pilotQueueCount(data: PilotSummary): number {
  return data.pendingCode + data.pendingCapstones + data.pendingCurriculum;
}

export function summarizePilot(input: PilotInput, now = new Date()): PilotSummary {
  const enrolled = new Set(input.enrollments.map(row => row.user_id));
  const published = new Map(input.lessons.filter(l => l.published).map(l => [l.id + ":" + l.content_version, l.module_id]));
  const mastery = new Map<string, Set<string>>();
  const started = new Set<string>();
  const firstMastered = new Set<string>();
  for (const row of input.progress) {
    if (!enrolled.has(row.user_id)) continue;
    const moduleId = published.get(row.lesson_id + ":" + row.content_version);
    if (!moduleId) continue;
    if (moduleId === "cs101-01") {
      started.add(row.user_id);
      if (row.completed) firstMastered.add(row.user_id);
    }
    if (!row.completed) continue;
    const userModules = mastery.get(row.user_id) ?? new Set<string>();
    userModules.add(moduleId);
    mastery.set(row.user_id, userModules);
  }
  const codeApproved = new Set(input.code.filter(item =>
    enrolled.has(item.user_id) && item.status === "reviewed" && item.code_tests_passed,
  ).map(item => item.user_id));
  const approvedSubmissionIds = new Set(input.capstones.filter(c => c.status === "reviewed").map(c => c.id));
  const capstoneApproved = new Set(input.reviews.filter(item =>
    enrolled.has(item.user_id) && !!item.submission_id &&
    approvedSubmissionIds.has(item.submission_id) && item.score >= 80 && item.code_tests_passed,
  ).map(item => item.user_id));
  const completed = [...enrolled].filter(id =>
    mastery.get(id)?.size === 10 && codeApproved.has(id) && capstoneApproved.has(id),
  ).length;
  const cutoff = now.getTime() - 7 * 86400000;
  const overdue = now.getTime() - 3 * 86400000;
  const pendingCode = input.code.filter(x => x.status === "submitted");
  const pendingCapstones = input.capstones.filter(x => x.status === "submitted");
  const moduleMastery = [...input.modules].sort((a,b) => a.position - b.position).map(m => ({
    id: m.id, title: m.title,
    mastered: [...mastery.values()].filter(s => s.has(m.id)).length,
  }));
  return {
    collectedAt: now.toISOString(),
    enrolled: enrolled.size,
    enrolledLast7Days: input.enrollments.filter(e => enrolled.has(e.user_id) && Date.parse(e.enrolled_at) >= cutoff).length,
    startedFirstLesson: started.size,
    masteredFirstLesson: firstMastered.size,
    allModulesMastered: [...enrolled].filter(id => mastery.get(id)?.size === 10).length,
    completionEligible: completed,
    approvedCapstones: capstoneApproved.size,
    approvedCode: codeApproved.size,
    pendingCode: pendingCode.length,
    pendingCapstones: pendingCapstones.length,
    pendingCurriculum: input.revisions.filter(x => x.status === "pending").length,
    overdueReviews: [...pendingCode,...pendingCapstones].filter(x => Date.parse(x.submitted_at) < overdue).length,
    moduleMastery,
  };
}
