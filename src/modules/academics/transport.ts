import type { ModuleCheck, ModuleLesson } from "./curriculum";

/**
 * Account-facing lesson props must never disclose the correct answer index or
 * answer-revealing explanation before submission. Authenticated grades come
 * from protected database RPCs, not client-evaluated quiz logic.
 */
export type LearnerModule = Omit<ModuleLesson, "checks"> & {
  checks: Array<Pick<ModuleCheck, "prompt" | "options"> & {
    answer?: number;
    explanation?: string;
  }>;
};

export function redactAssessmentAnswers(module: ModuleLesson): LearnerModule {
  return {
    ...module,
    checks: module.checks.map(({ prompt, options }) => ({
      prompt,
      options,
    })),
  };
}
