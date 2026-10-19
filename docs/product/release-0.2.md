# KHANIVERSITY · Virtual University Release

## Product architecture

The shared academic model is university → school → program → course → module → lesson. The site contains six schools and 18 catalog courses. CS101 is the complete, authored ten-module course; other course records open topic-specific preview samplers until their curricula are authored. Shared enrollment, assessment, profile, cohort, project, review and credential services live in the modular Next.js application and PostgreSQL schema.

## Six connected learning systems

| System | Current product flow | Record boundary |
| --- | --- | --- |
| AI Professor | Lesson-grounded tutor, authored offline guides, optional Responses API | Live AI needs a valid server key; chat is not stored |
| Adaptive Learning Engine | Six-question topic diagnostic and next-step suggestion | Preview result stays in local storage |
| CodeLab | Bundled Pyodide worker, editor, output and checked Python challenge | Code executes locally in a bounded browser worker |
| Virtual Technology Labs | Six interactive systems and security scenarios | Simulation evidence stays in local storage |
| Intelligent Assessment System | Ten module checks, server-side account scoring, reviewed capstone | Hidden answer keys and account grades remain in the database |
| Skills Passport & Certifications | Local evidence export and issued course awards | Internal awards are DB verifiable at `/verify/[code]`; no accredited degree |

The final-phase social layer is represented by account-backed cohorts, discussion posts, project sharing and structured peer reviews. Academic staff have scoped cohort and capstone workflows, an audit trail and gated credential issuance. The PWA shell caches only public routes and static assets; account, API, admin and learning-record paths are excluded.

## Release 0.2 improvement pass (October 2026)

- StudentOS now derives a next-best-lesson recommendation, a revision queue, and
  a visible mastery count from the current learning record rather than inventing
  streaks or treating quiz mastery as a degree.
- Connected diagnostic practice is session-only; preview diagnostic evidence
  stays in browser-local records. Neither becomes an official course grade.
- CodeLab provides an explicit Python draft export; connected practice does
  not write unverified checks into a student's academic database record.
- The AI Professor now appears across CS101, with module-specific lesson
  grounding composed on the server. Authored guides work without an AI key.
- Account recovery and PKCE auth email callback are added for student
  resilience, subject to provider/email validation.
- The release remains a modular monolith and requires dedicated live-account,
  privacy, security, accessibility and production checks before public rollout.

A public-facing learning-data disclosure is available at `/privacy`. It deliberately flags retention, deletion, data-controller contact, and legal-governance decisions as incomplete rather than asserting unverified compliance.

## Original blueprint Sections 07 and 08 — five connected platforms

The unified `/platforms` gateway organizes the original Public Site, Student Portal,
Learning Studio, CodeLab and Academic Administration within one modular monolith.
The new `/admissions` page provides a transparent pilot-entry route without
accreditation claims. CodeLab now restores bounded browser-local Python drafts
without mixing anonymous preview data with another student's account draft.
Course staff have a protected, read-only CS101 curriculum publication register
showing actual database versions and publication status.

The nine Section 07 data domains are recorded as an explicit existing-versus-planned
registry in `src/modules/platforms/data-domains.ts`. This intentionally does NOT
create missing tables like `ai_usage`, `mastery_records`, `code_submissions`
or `feature_flags` without reviewed migrations, ownership/RLS decisions and
an approved connected release gate. Account-backed grade data is not inferred
from browser-only code drafts.

## External setup boundaries

The full application runs locally without cloud credentials in preview mode. Account-backed learning requires applying both ordered Supabase migrations and setting the public project URL and publishable key. Live AI requires a valid server-only provider key. Labs currently simulate infrastructure rather than provision cloud resources. Email delivery, public hosting and an institutional accreditation process are external operations and are not represented as completed.

See [the root README](../../README.md) for setup, role assignment, verification and check commands.
