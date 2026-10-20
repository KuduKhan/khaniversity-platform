# KHANIVERSITY 0.3 — Academy Pilot & Academic Operations

**Scope:** Production-capable academic operations for the existing ten-module
CS101 pilot. This is an operational platform upgrade, **not** a public university
accreditation announcement or a claim that the 50-person cohort exists.

## Shipped engineering scope

- Staff-authenticated AdminOS command center, reading live Supabase data.
- Honest cohort reporting: enrollment, first-lesson activation, published-version
  module mastery, staff-approved CodeLab/capstone evidence, prospective completion
  eligibility, recent admissions and pending/overdue staff review workloads.
- No synthetic student counts and no browser-local preview events in AdminOS.
  Empty cohorts display a dash for undefined activation/completion rates.
- Deterministic paginated record fetches with an explicit upper safety bound:
  data-fetching failures and oversized cohorts refuse to show partial metrics.
- Staff register with explicit two-step role revocation, administrator-only RPC,
  self-revocation prevention and an audit event. The first trusted administrator
  **cannot** be appointed by public signup or by this feature.
- Public credential verification keeps the required random-code lookup, while
  the externally callable function becomes SECURITY INVOKER. The narrowly scoped
  SECURITY DEFINER lookup moves under the unexposed private schema, where all
  other routines remain inaccessible to anonymous users.
- Database migration: `supabase/migrations/20261020120000_pilot_operations.sql`.
- Automated unit, database integration and browser regression checks.

## Exact metric definitions

All metrics are restricted to enrolled students of CS101. `enrolled` is unique
CS101 learner accounts. `enrolledLast7Days` counts new enrollments since seven
days before the sampled server timestamp. First-lesson activation requires an
account-scoped progress attempt in the published CS101-01 lesson version.
Mastery requires an 80%+ completion record tied to a published lesson version.
An *eligible completion* requires all ten modules mastered, one independent
CodeLab review passing required tests, and one accepted capstone snapshot
matching a passing human rubric and code tests. It is **not** the number of
issued credentials. `overdueReviews` counts pending code/capstone submissions
older than 72 hours. Rates have an undefined (not zero-percent) value when
the cohort is empty. Cohort-level aggregates expose no personal identifiers.

Planned pilot hypotheses from the KH-001 blueprint are 50 learners, 70% first
lesson activation and 40% CS101 completion; these are targets, **not achieved
or audited results**.

## Deployment sequence

1. Run and review lint, TypeScript, PGlite migration integration, all unit
   checks, production build, browser tests and RLS negative tests in CI.
2. Confirm staging/production backup and a tested restore path. Apply the
   additive migration `pilot_operations` to the expected KHANIVERSITY project
   using an authorized operator before promoting the dependent AdminOS actions.
3. Inspect migration history and Supabase security advisors. Test the public
   credential verification using a non-existent code under the anonymous role,
   and ensure other private routines remain inaccessible to anonymous callers.
4. Merge only the reviewed, CI-passing branch and verify the deployment commit
   on the expected Vercel project. Keep access protection unchanged.
5. Manually register and email-confirm two **distinct** disposable learner
   accounts through the application, then establish separate authorized
   administrator and academic reviewer accounts; enforce staff MFA.
6. Run the connected browser acceptance gate without skipped checks and verify
   cross-account read/write isolation, assessment grade tampering protections,
   code submission, capstone review, award issuance and public verification.
7. Confirm production mail redirects/SMTP, account recovery, accessibility at
   multiple devices/zoom levels, error monitoring, backup restoration, privacy
   rights handling, operational contacts and an incident response plan.
8. Only after a documented human approval, open the controlled learner pilot.

## Known release gates / deliberate exclusions

The real email signup, privileged MFA and two-user acceptance tests require
external identities and authenticated operator action; code CI cannot replace
them. A qualified reviewer must be distinct from the author/learner.
Production privacy governance (data-controller identity/contact, retention,
correction/deletion request handling, third-party transfers) must be approved.
Advanced container execution, 17 additional preview courses, new degree
programs and institutionally accredited certificates are **not** part of 0.3.

The platform remains a Next.js modular monolith with Supabase RLS, Vercel
hosting and GitHub Actions. Never bypass staff authorization or mint fake
identity evidence to make an acceptance report appear green.
