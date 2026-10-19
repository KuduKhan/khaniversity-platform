// Original blueprint v1.0, Section 07. This registry documents the
// EXISTING foundation schema and separately tracks proposed tables.
// This is an internal implementation inventory, not a marketing checklist.
export type DataDomain = {
  domain: string;
  existing: readonly string[];
  planned: readonly string[];
};
export const dataDomains: readonly DataDomain[] = [
  { domain: "Identity", existing: ["profiles", "user_roles", "course_staff"], planned: ["roles"] },
  { domain: "Academic catalog", existing: ["schools", "programs", "courses", "modules", "lessons"], planned: [] },
  { domain: "Curriculum", existing: ["lessons.content_version", "lesson_revisions"], planned: ["learning_outcomes", "lesson_outcomes", "content_versions"] },
  { domain: "Enrollment", existing: ["enrollments", "lesson_progress"], planned: ["mastery_records"] },
  { domain: "Assessment", existing: ["assessment_attempts", "project_submissions", "capstone_reviews", "peer_reviews"], planned: ["assessments", "questions", "submissions", "test_cases"] },
  { domain: "CodeLab", existing: ["project_drafts", "coding_exercises", "code_submissions"], planned: [] },
  { domain: "AI tutoring", existing: [], planned: ["tutor_sessions", "tutor_messages", "ai_usage"] },
  { domain: "Credentials", existing: ["credentials"], planned: ["credential_evidence"] },
  { domain: "Operations", existing: ["audit_logs", "course_staff"], planned: ["feature_flags"] },
] as const;
