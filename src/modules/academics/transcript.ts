import { courseModules } from "./curriculum";

export type AssessmentAttempt = { id: number; module_id: string; score: number; submitted_at: string };
export type CodeSubmission = { id: string; exercise_id: string; status: string; code_tests_passed: boolean; feedback: string; submitted_at: string; reviewed_at: string | null };
export type CapstoneSubmission = { id: string; title: string; status: string; submitted_at: string; reviewed_at: string | null };
export type CapstoneReview = { submission_id: string | null; score: number; code_tests_passed: boolean; feedback: string; reviewed_at: string };
export type Award = { credential_code: string; title: string; issued_at: string; revoked_at: string | null };
export type Diagnostic = { score: number; created_at: string };
export type LessonProgress = { lesson_id: string; content_version: string; score: number; completed: boolean; updated_at: string };
export type TranscriptData = {
  progress: LessonProgress[];
  attempts: AssessmentAttempt[];
  code: CodeSubmission[];
  capstones: CapstoneSubmission[];
  reviews: CapstoneReview[];
  awards: Award[];
  diagnostics: Diagnostic[];
};

export function summarizeTranscript(data: TranscriptData) {
  // Lesson progress is authoritative for mastery. The first CS101
  // foundation check writes lesson_progress without assessment_attempts.
  const publishedLessons = new Set(courseModules.map(lesson => lesson.id));
  const latestProgress = new Map<string, LessonProgress>();
  for (const row of [...data.progress].sort((a,b) => b.updated_at.localeCompare(a.updated_at))) {
    if (publishedLessons.has(row.lesson_id) && !latestProgress.has(row.lesson_id))
      latestProgress.set(row.lesson_id, row);
  }
  const reviewedCapstones = new Map(data.reviews.filter(r => r.submission_id).map(r => [r.submission_id!, r]));
  return {
    assessedModules: latestProgress.size,
    masteredModules: [...latestProgress.values()].filter(row => row.completed).length,
    attempts: data.attempts.length,
    reviewedCode: data.code.filter(item => item.status === "reviewed" && item.code_tests_passed).length,
    pendingReviews: data.code.filter(item => item.status === "submitted").length + data.capstones.filter(item => item.status === "submitted").length,
    activeAwards: data.awards.filter(item => !item.revoked_at).length,
    reviewedCapstones,
  };
}
