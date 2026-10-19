# Foundation 0.1 stabilization on the 0.2 codebase

Scope: stabilize the already-implemented CS101 account journey without
rolling back the browser-local 0.2 learning previews or breaking the modular
monolith.

## Implementation
- Authenticated follow-on lessons require a valid account and CS101 enrollment
  before lesson content or a capstone draft is presented.
- Student progress and project draft reads explicitly filter by authenticated
  user ID in addition to database RLS.
- Public lesson props omit formative answer keys; assessments are scored by
  Supabase functions, not by the authenticated client.
- Browser-local preview scores and drafts no longer override account-backed
  scores and drafts on connected module pages.
- Dashboard continuation goes to the capstone rather than restarting module
  one when every module is mastered.
- The foundation lesson points to the existing next lesson rather than
  incorrectly claiming follow-on lessons are still under development.

## Verification gates
1. npm ci; npm run lint; npm run typecheck; npm test; npm run build;
   npx playwright install --with-deps chromium; npm run test:e2e.
2. In a dedicated connected environment, verify signup, confirmation,
   sign-in, enrollment, five-question scoring, highest-score retention,
   sign-out, and restored progress in a new browser session.
3. Test a second account: it cannot see, edit, or claim the first account's
   enrollment, progress, score, or private project draft.
4. Poison the browser preview record with a 100% score and a draft, then sign
   in. The connected learner view must show only server-backed values.
5. Confirm that published authenticated module props contain no
   `answer` fields and that unauthenticated users do not reach protected routes.
6. Review the credential-verification SECURITY DEFINER exposure, rate limiting
   and disclosure policy before public rollout. Retain intentional public
   verification only with a documented security model.
7. Review database advisor findings and add indexes only where measured
   queries justify them; review overlapping SELECT policies without broadening
   permissions.

Local preview tests and read-only database inspection do not substitute for
the connected two-account test. No claim of public production readiness,
accreditation, or an accredited credential is implied by this stabilization.
