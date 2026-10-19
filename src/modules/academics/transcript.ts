export type AssessmentAttempt = { id: number; module_id: string; score: number; submitted_at: string };
export type CodeSubmission = { id: string; exercise_id: string; status: string; code_tests_passed: boolean; feedback: string; submitted_at: string; reviewed_at: string | null };
export type CapstoneSubmission = { id: string; title: string; status: string; submitted_at: string; reviewed_at: string | null };
export type CapstoneReview = { submission_id: string | null; score: number; code_tests_passed: boolean; feedback: string; reviewed_at: string };
export type Award = { credential_code: string; title: string; issued_at: string; revoked_at: string | null };
export type Diagnostic = { score: number; created_at: string };
export type TranscriptData = {
  attempts: AssessmentAttempt[];
  code: CodeSubmission[];
  capstones: CapstoneSubmission[];
  reviews: CapstoneReview[];
  awards: Award[];
  diagnostics: Diagnostic[];
};

export function summarizeTranscript(data: TranscriptData) {
  const bestModuleScores = new Map<string, number>();
  for (const attempt of data.attempts) {
    bestModuleScores.set(attempt.module_id, Math.max(bestModuleScores.get(attempt.module_id) ?? 0, attempt.score));
  }
  const reviewedCapstones = new Map(data.reviews.filter(r => r.submission_id).map(r => [r.submission_id!, r]));
  return {
    assessedModules: bestModuleScores.size,
    masteredModules: [...bestModuleScores.values()].filter(score => score >= 80).length,
    attempts: data.attempts.length,
    reviewedCode: data.code.filter(item => item.status === "reviewed" && item.code_tests_passed).length,
    pendingReviews: data.code.filter(item => item.status === "submitted").length + data.capstones.filter(item => item.status === "submitted").length,
    activeAwards: data.awards.filter(item => !item.revoked_at).length,
    reviewedCapstones,
  };
}
