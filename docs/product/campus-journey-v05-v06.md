# KHANIVERSITY v0.5–v0.6: Campus Journey and CS101 Learning Excellence

**Status:** development candidate for academic content review and quality acceptance. Not an accreditation or automatic production-release authorization.

## Product goal

Keep one coherent pathway:

Discover a course → Understand the syllabus → Learn → Practice → Demonstrate mastery → Complete the capstone → Review academic evidence.

### v0.5 — Campus Information Architecture

- Student navigation is grouped by user intent: **Home**, **My Learning**, **Practice & Labs**, **My Achievements**, **Campus Resources**. Existing staff-only academic operations remain privileged.
- Both `/learn/cs101` (signed-in) and `/preview/learn/cs101` (device-only preview) provide the same course hub.
- The course hub contains a seven-step journey, all ten modules grouped into four stages, learning outcomes, planning estimates, lesson progression and evidence disclaimers.
- The existing StudentOS dashboard continues to own enrollment and the immediate primary continuation; a shortcut opens the course hub instead of duplicating a competing continue control.
- Every module links back to the in-app syllabus and forward to the next lesson.
- Legacy public catalog entry remains intact, with a more structured syllabus.

### v0.6 — Syllabus & Learning Excellence

- `course-outline.ts` is the public single source for the ten module IDs, titles, descriptions and learning outcomes. It includes no assessment questions or answer keys.
- `curriculum.ts` owns authored lesson content and quiz answer keys. Client-side learner navigation, study guides, dashboard and progress calculator now consume the public outline.
- Each existing CS101 module receives one additional worked application explicitly connected to the Personal Study Planner.
- Lesson orientation shows stage, suggested effort, prerequisite, practice objective and capstone connection. Estimates are not mandatory learning time or an assessment requirement.
- Existing assessments, score thresholds, immutable submitted snapshots, authorization and award rules are unchanged.

### Academic and security boundaries

- Local preview practice and reflections remain browser-only, separate from server-confirmed records and awarded credentials.
- Authorized assessment scoring and staff capstone review remain independent of the public course guide and AI tutoring.
- Faculty should review added teaching sections for accuracy, readability, accessibility and consistency with the existing assessment blueprint before broad learner use.
- `course-outline.ts` excludes answer keys by construction. Avoid reimporting `curriculum.ts` into client-facing navigation or overview components.
- No Supabase migration, role grant, new certification or clinical/regulated capability is introduced.

## Validation

Required before production approval:
1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npm run test:e2e` — including seven-step learning path, course hub at 320–1920px, keyboard navigation, protected routes, lesson completion, learner progress and account/preview boundaries
6. Academic content reviewer sign-off; signed-in cross-account and reviewer acceptance, real-device keyboard/zoom/screen-reader spot checks

A READY Vercel build alone does not establish learner-account, staff review or academic content acceptance.

## Rollout and rollback

Keep this work on a review branch until checks and sign-off are complete; merge only a reviewed SHA. Monitor production for auth errors, route failures, submission errors and page overflow. If any issue compromises learning or academic evidence, roll back to the prior stable deployment.
