# KHANIVERSITY Blueprint — implementation contract

The blueprint is a build specification, not a feature list to reproduce on a marketing page.

## Working vertical slice
Public catalog → account registration and verification → course enrollment → ten CS101 learning modules → graded checks → Python CodeLab submission → independent staff review → learner evidence and audit.

## Acceptance criteria for every new capability
1. A working screen and meaningful empty/error/loading states.
2. A persisted server-side data model with migrations, ownership constraints and RLS.
3. Authorization enforced on the server, not just a hidden button.
4. An executable happy-path test and at least one negative security test.
5. Accessible, responsive mobile/tablet/desktop UI.
6. Explicit status: implemented, connected-environment validation required, or not built.
7. No accreditation, degree, verified skill or live-AI claim without evidence.

## Remaining blueprint implementation backlog
- Identity: verify real two-account signup, confirmation, recovery and cross-account isolation.
- Catalog: publish complete authored lessons and assessed coursework beyond CS101.
- Curriculum: versioned multi-course authoring, publication and rollback with staff approvals.
- Enrollment: admission rules, cohort controls, enrollment lifecycle and learner transfers.
- Assessment: server-owned question banks, retake policies, rubric grading and appeals.
- CodeLab: sandbox execution and tamper-resistant server grading for official credit.
- AI: opt-in tutoring, provider governance, rate limits, moderation and privacy controls.
- Credentials: policy-driven internal awards, issuance, revocation and public verification.
- Operations: faculty, moderation, accessibility, analytics, audit and incident handling.

No backlog item should be advertised as complete before its migration, route, policy, tests and connected validation exist.
