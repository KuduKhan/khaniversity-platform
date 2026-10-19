# Foundation Release 0.1

Acceptance story: a visitor discovers CS101, explores its ten-module roadmap, enrolls, reads a complete computational-thinking lesson, answers a formative check and returns to persisted progress. Account-backed operation uses managed Supabase identity and database scoring; an isolated local preview supports immediate review.

Delivered: academic brand and responsive shell; public catalog; account registration/sign-in/sign-out integration; protected dashboard and lesson; enrollment; worked examples, practice hints and five-question feedback; highest-score preservation; versioned schema and ownership policies; CI and regression coverage.

Not part of 0.1: complete CS101, AI Professor, CodeLab, staff console, grades override, capstone, payment, credentials, PWA/offline lessons. Future roadmap entries must remain visibly planned.

Before a real learner pilot: connect a designated Supabase environment; apply migrations; run live two-account isolation and signup/email/session/recovery tests; complete instructional and accessibility review; define privacy notice, consent, retention, export/deletion and incident handling; configure backups and abuse controls. No production readiness or external integration validation is implied by local checks.

Identity follow-on: the Foundation 0.2 stabilization branch adds the server-side PKCE confirmation callback and password recovery/update pages. These require valid Supabase Auth redirect allowlisting, SMTP and a live end-to-end email test; they are not validated by browser-preview CI alone.

Next milestone: identity hardening and lesson publication infrastructure, followed by the Python execution and assessment slices. Keep each release independently usable.

Dependency audit (18 October 2026): npm reports five high-severity entries along the development-only eslint-config-next → fast-glob → micromatch → braces chain. These represent one upstream issue, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), for which the advisory lists no patched braces release. The tooling reads repository-controlled file patterns; application requests do not reach this dependency. Keep tracking the upstream fix; do not apply npm's suggested major downgrade of the Next.js lint configuration or remove checks to hide the advisory.
