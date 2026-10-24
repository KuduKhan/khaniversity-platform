# KHANIVERSITY v0.4 — Learning Studio upgrade (incremental)

Status: implementation branch / draft pull request, not a completed production release.

## Implemented: personal Study Notebook + revision desk

- Every CS101 learning module now includes a guided reflection form.
- Notes support a confidence label, explicit save, review acknowledgement,
  JSON export and confirmation before deleting a saved reflection.
- Learner StudentOS shows an honest personal revision queue with links back
  to due lessons.
- A note marked "Need another look" is ready immediately; after review,
  it returns in one day. "Still practicing" reviews recur after three days;
  "Confident" reviews recur after fourteen days.
- JSON is validated and length-constrained. Invalid, oversized or out-of-version
  data is ignored safely; writes read the latest value before updating.
- The UI is mobile-first, keyboard navigable, uses visible labels and accessible
  status feedback, and respects reduced-motion preferences.

## Storage and academic-data boundaries

- Personal notes are local browser learning aids only.
- Preview uses the distinct "preview" namespace. Authenticated CS101 notes
  use an account-UUID-specific local browser namespace so another signed-in
  account does not see the prior account's notes through the UI.
- Notes are not synchronized between devices or securely backed up.
  A browser reset or deletion can lose them; learners can export JSON.
- Browser-local notes are not stored in Supabase, sent to faculty, used
  by the AI tutor, or counted as verified learning evidence.
- Local browser storage on a shared device is not a secure vault.
- Assessments, course progression and credentials remain governed by the
  existing server-authoritative Supabase workflows.

## Quality gates

1. npm ci then npm run lint, npm run typecheck, npm test,
   npm run build and npm run test:e2e.
2. Check note persistence across refresh, review intervals, explicit deletion,
   export, invalid storage content and keyboard behavior.
3. Test previews on compact phones (320, 375, 430 px), tablet layouts
   (768/1024 px), desktop, text zoom and with reduced-motion enabled.
4. Verify that signing into a different learner account cannot display
   the previous learner's local notes in the app.
5. Verify that preview progress does not appear on signed-in dashboards
   and that writing a note changes no database course grades.
6. Recheck the connected learner acceptance gate before production promotion.
7. Do not merge merely because static CI checks pass; review the PR and
   release readiness with an authorized operator.

## Remaining v0.4 work

- Deepen lesson scaffolding with worked examples, learner practice and
  accessible navigation throughout the ten-module pathway.
- Add faculty-reviewed structured practice without exposing answer keys.
- Improve connected, server-backed learning continuity and explicit
  privacy/retention controls before promoting notebook sync to accounts.
- Complete cross-device authenticated UI and performance validation.

This document intentionally does not claim the 50-learner pilot has begun,
that credentials are accredited, or that the release is live.
