# KHANIVERSITY v0.7 — Learning Continuity and Academic Integrity

**Status:** draft development candidate. Does not authorize production release.

## Scope

Improve the existing CS101 experience without introducing a new school, course, academic credential, scoring rule or backend table.

### 1. Single progress contract
- `buildLearningPlan` now provides the canonical module checkpoint status: **not-started**, **needs-review**, **mastered**.
- It owns next-step decisions and handles invalid/out-of-range browser values as incomplete evidence.
- StudentOS and the CS101 syllabus consume these same checkpoint objects. A future learning-surface refinement should reuse the contract rather than compute independent mastery.

### 2. Teaching consistency
- A shared `LessonOrientation` component describes the learning stage, suggested effort, prerequisite, practice objective and connection to the Personal Study Planner for every CS101 module.
- The ten existing modules, thresholds, faculty-published supplements, guided exercises and capstone rubric are unchanged.

### 3. Assessment confidentiality
- Signed-in module props now omit **both answer indexes and answer-revealing explanations**. The old serializer only removed the answer index.
- The special first lesson likewise sends only the prompts/options to authenticated clients.
- Learners receive the verified score after a protected assessment RPC. Authenticated screens direct learners to the teaching material and guided practice without supplying the answer key.
- Browser preview continues to show formative explanations and local results, with no official grade or credential implications.
- This is defense-in-depth, not a substitute for secure server-side scoring, RLS and authorized test-account verification.

### 4. Capstone save resilience
- Draft-save success appears only after actual persistence; failures retain the typed draft and provide actionable retry feedback.
- Prevent overlapping draft saves and formal submission. While either operation is pending, project inputs are disabled to prevent incorrectly claiming that newer edits were saved.
- Preview persistence remains device-local; signed-in submission still requires protected RPC confirmation.

## Acceptance gates

1. Lint / TypeScript / tests / build / Playwright on the exact PR SHA.
2. Faculty review of the shared teaching presentation and assessment-feedback policy.
3. Two real learners and a reviewer: account recovery, cross-account record isolation, protected assessment submissions and capstone save/review.
4. Keyboard and actual-device testing, with confirmation that preview state is never reported as a credential.
5. Production release only after issues are resolved and explicitly approved.

## Out of scope

- No additional CS101 modules, schools, credentials or AI features.
- No changes to Supabase migrations, RLS, score thresholds or capstone-review RPCs.
- No automatic cross-device syncing of personal notes/practice, which still requires separate privacy and authorization acceptance.
