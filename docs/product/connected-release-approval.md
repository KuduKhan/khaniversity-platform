# KHANIVERSITY 0.1 → 0.2 Connected Release Approval

**Decision at initial review:** BLOCKED pending verified end-to-end Supabase Auth and email flows. Do not merge or promote a public release solely because preview CI is green.

## Verified live database evidence

On the connected PostgreSQL project, within explicit `BEGIN` / `ROLLBACK` transactions only:
- Two simulated authenticated identities were isolated by RLS.
- Owner-only enrollment and assessment score visibility passed.
- Module 01 scoring returned 100%, and a direct client update was rejected.
- Module 02 scoring with database ID `cs101-02` returned 100%, retained the highest score on retry and protected assessment attempts.
- The other identity could neither read protected progress nor read private capstone drafts, and could not submit an unenrolled assessment.
- Confirmed no test users or learning data remained after rollback.

**Caveat:** Database role/JWT simulations are not Supabase Auth logins. They do not prove confirmation email, PKCE callback, cookies, refresh, browser authorization or cross-account session behavior.

## Critical application finding repaired

Authenticated Module 02–10 actions previously sent route slugs to an RPC expecting database module IDs. `src/modules/assessments/module-identifiers.ts` now explicitly maps the nine learner slugs to `cs101-02` through `cs101-10`. The connected browser suite now exercises a real Module 02 submission as well as Module 01.

## Mandatory connected gate (no skipped tests as approval)

1. Provision **two disposable, email-confirmed real Supabase Auth test identities** on an explicitly authorized project.
2. In GitHub, create and protect the `release-validation` environment. Require reviewer approval for access to protected test credentials; do not store or paste account passwords in issues, logs or chat.
3. Add environment secrets:
   `KHANIVERSITY_SUPABASE_URL`,
   `KHANIVERSITY_SUPABASE_PUBLISHABLE_KEY`,
   `KHANIVERSITY_E2E_EMAIL`,
   `KHANIVERSITY_E2E_PASSWORD`,
   `KHANIVERSITY_E2E_EMAIL_2`,
   `KHANIVERSITY_E2E_PASSWORD_2`.
4. Add non-secret environment variable `KHANIVERSITY_EXPECTED_PROJECT_REF` for the intentional testing target; URL and ref must match.
5. Run the **Connected release approval gate** workflow on the reviewed branch. It fails when secrets are missing or the identities are the same; it does not silently skip connected tests.
6. Inspect GitHub Actions proof, user A/B enrollment and private-draft isolation, both module checks, and persisted progress after browser reload.
7. Manually verify signup/confirmation email, PKCE callback, password-recovery email, expired token, password reset, sign-out, and new sign-in with a dedicated test mailbox. The existing automated test does **not** cover email delivery or recovery.
8. Test the deployed Vercel preview URL with its own allowed redirect URL and publishable key, including phone viewport and accessibility smoke test.
9. Review the public credential verification function privileges, RLS advisors, AI tutor quotas and abuse prevention, and backup/retention/privacy governance before enabling a general public learner pilot.
10. Review PR #1, then #2, then #3. Only merge and promote with explicit evidence of the above and verified deployment scope.

## Release criteria
- [ ] Two real student browser accounts pass connected E2E with no skip
- [ ] Email confirmation and account recovery completed
- [ ] Cross-account read/write isolation reviewed
- [ ] CI lint, typecheck, unit/integration and browser suite green
- [ ] Public credential RPC and AI provider security decisions documented
- [ ] Supabase Auth redirects and email SMTP configured for intended domain
- [ ] Preview deploy checked against expected Git commit and environment
- [ ] Human approver accepts risk register and authorizes merge

No billable Supabase branch was created: branching requires user cost confirmation.
