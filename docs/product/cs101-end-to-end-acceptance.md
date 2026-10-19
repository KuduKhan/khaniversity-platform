# KHANIVERSITY CS101 vertical slice — release acceptance

**Source:** KH-001 Master Development Blueprint v1.0, October 2026. The
deliverable is a usable **School of Computer Science CS101 MVP**, not
simultaneous delivery of seventeen additional unpublished courses or
accredited degree programs.

## Implemented in the repository

| Capability | Working path and ownership boundary |
| --- | --- |
| Catalog/admissions | /catalog, /catalog/cs101, /admissions |
| Learner identity | /signin, /recover, /reset-password; Supabase Auth |
| Enrollment and progress | /dashboard; enrolled user owns their CS101 record |
| CS101 learning | Ten curriculum modules and quizzes; database-owned assessment keys |
| Adaptive StudentOS | /path; formative six-question results now saved to a private account record |
| CodeLab | /codelab; Pyodide worker, local drafts, enrolled code submissions and staff review |
| Capstone | /learn/cs101/personal-study-planner-capstone; private drafts vs explicit immutable submitted snapshots |
| Academic review | /admin; assigned course staff review a **submission**, record weighted rubric and test outcome |
| Curriculum publication | /admin; instructor-authored teaching supplements need separate staff approval |
| Skills Passport | /passport; formative records separated from internally issued awards |
| Credential verification | /verify/[code]; award requires ten mastered modules, independently reviewed CodeLab work and accepted submitted capstone |

## Database migration and verification

After the foundation, virtual-university and operational-blueprint migrations,
run `supabase/migrations/20261019224500_capstone_submission_review.sql`.
It adds `capstone_submissions` and `learning_diagnostics`; updates
`capstone_reviews` to bind reviews to submitted snapshots; and replaces
the CS101 credential rule with verification of reviewed work.

The SQL creates RLS and uses short, authorized database functions to check
identity, enrollment, rate limits, review roles, rubric bounds and audit events.
Every formal capstone review is immutable once recorded; a declined student may
save changes and submit a **new version**. Editing their saved draft does not
alter an earlier submission.

The migration intentionally **revokes direct authenticated insert/update** on
`capstone_reviews`. The web app must be deployed with the matching RPC-based
academic review action.

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
and `npm run test:e2e`. Database isolation is tested in PGlite, but PGlite
tests do **not** replace two-user testing against real Supabase Auth.

## Connected release approval — manual prerequisites

1. In Supabase Auth create and verify two dedicated nonproduction test learner
   accounts. **Do not create accounts by directly inserting into auth.users.**
2. Enroll both normally, verify recovery email callback and full sessions.
3. Designate real instructional roles **only after confirming** the correct
   accounts, through an authorized bootstrap and audited course-staff assignment.
   Do not grant administrator from unverified email or user-editable metadata.
4. Configure `release-validation` GitHub environment secrets for the dedicated
   two-account connected test gate. This must pass and verify cross-account
   isolation, course assessment writes and protection against grade tampering.
5. Check app production environment and email redirects. `OPENAI_API_KEY`
   is needed for **live** AI tutoring; authored guides remain available without it.
6. Verify accessibility with assistive technologies/zoom and on actual phones,
   tablets, laptops and desktops; review ODPC privacy requirements and enforce
   MFA for privileged access before inviting real students.
7. Confirm reviewer and instructor are distinct personnel. Run a full capstone
   submission → academic review → credential verification with real accounts.
8. Record rollback method and audit/security review before public enrollment.

**Current verification limitation:** Prior to this implementation the connected
Supabase project had no real Auth users or enrollments. The live two-account
workflow and privileged MFA cannot be marked complete until tested. The
seventeen additional catalog entries remain guided previews, not complete
course programs. Claims of accredited awards/degrees are prohibited.
