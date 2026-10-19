import type { ModuleCheck, ModuleLesson } from "./curriculum";

// Formative answer keys are needed for local preview, not for authenticated
// lesson props. Database-side scoring remains authoritative for accounts.
export type LearnerModule = Omit<ModuleLesson, "checks"> & {
  checks: Array<Omit<ModuleCheck, "answer"> & { answer?: number }>;
};

export function redactAssessmentAnswers(module: ModuleLesson): LearnerModule {
  return {
    ...module,
    checks: module.checks.map(({ prompt, options, explanation }) => ({
      prompt,
      options,
      explanation,
    })),
  };
}
