# KHANIVERSITY Premium Experience — Existing Feature Refinement

Release candidate: **UX-only quality pass** · November 2026. This is **not** a new feature, academic capability, external integration, credential scheme, or production approval.

## Scope and implementation sequence

### 1. Navigation simplification
- StudentOS destinations and page headings derive from a shared in-component route registry.
- Existing learner tools, resources, public catalog and authorized AdminOS remain discoverable.
- A redundant mobile academic-catalog header shortcut and duplicated mobile sign-out were removed; the signed-in mobile masthead retains one sign-out action.
- Preview mode retains a distinct exit action and clearly separates browser-only activity from account records.
- Mobile navigation uses readable text rows instead of an 8px four-column icon grid, with Escape/focus restoration.

### 2. Design-system cleanup
- Removed legacy competing mobile sidebar and hidden-score CSS rules.
- Premium and responsive layers supply consistent card radii, button geometry, focus states and reduced-motion support.
- Existing navy, gold, sage and ivory brand palette is retained; no decorative restyling replaces educational content.
- Code examples and academic tables keep internal horizontal scrolling; the page itself must fit.

### 3. StudentOS overview refinement
- Existing next-step panel and primary continuation are promoted above revision aids and practice tracker.
- The main learning action is displayed once in the welcome area rather than repeated in the supplementary recommendation panel.
- Mastery uses the existing learning-plan calculation; module labels remain explicit on compact screens.

### 4. Current feature polish
- Practice tracker shows both its curricular lesson and the specific next exercise, resolving an E2E mismatch.
- Lesson order and next-module navigation are sourced from the one CS101 curriculum registry rather than a hand-maintained list.
- Python editor blocks execution before its runtime is ready and blocks reset while a run/submission is active.
- AI Professor exposes an accessible conversation log, busy state and labeled input.
- No changes to question answers, grading functions, RLS, awards, staff privileges or database schema.

### 5. Responsive and accessibility QA
- Test menu accessibility at 320px, readable labels (>=13px) and targets (>=44px), Escape, focus restoration and destination uniqueness.
- Test dashboard information priority, fit at 320, 375, 430, 768, 1024, 1440px and lesson continuation.
- Test CodeLab runtime readiness and practice tracker progression; maintain existing account-isolation and data-integrity tests.
- Manual QA still required on Android, tablet and desktop for 200%/400% text zoom, screen readers, real touch behavior and slow connections.

### 6. Controlled release
1. Pass lint, typecheck, unit/integration, build and every Playwright regression on the **exact HEAD SHA**.
2. Verify Vercel preview corresponds to that SHA. A READY preview is **not** proof of browser acceptance.
3. Confirm signed-in learner A/learner B/independent reviewer operation, account recovery, private evidence and staff authorization against approved Supabase migrations and production-like data.
4. Review and explicitly approve PR. Promote to `main` only after approval; inspect the resulting production deployment SHA and smoke tests.
5. Do not describe KHANIVERSITY as accredited or treat local exercise/study evidence as issued credentials.

## Out-of-scope
New schools, degree programs, certifications, AI capability, billing, third-party apps, realtime collaboration and new database domains.

## Rollback
Keep the prior production commit/deployment as a rollback candidate. Do not alter schema during this UI quality pass.
