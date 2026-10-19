# KHANIVERSITY Foundation

This is a Next.js App Router modular monolith. Follow the October 2026 KHANIVERSITY blueprint. Foundation 0.2 adds working local-preview slices of the six core learning systems while retaining the broader Computer Science Academy MVP as the product target.

- Keep academic, enrollment and assessment logic in their domain modules. Keep server-only database clients out of client bundles.
- Never bypass authentication, RLS, ownership checks, grading or CI to make a test pass. Preview paths are explicitly separate and never establish identity.
- Verify claims in every protected server entry point. Use publishable keys with RLS; never introduce a service-role key in application code.
- Database scoring is authoritative. Clients cannot directly write lesson progress. Version changes require new content versions and assessment review.
- Preserve keyboard interaction, visible focus, semantic headings and responsive layouts.
- Before handoff run lint, typecheck, unit/database tests, build and Playwright. State exactly which external flows remain unverified.
- The preview AI Professor is lesson-grounded formative support; it is not an authoritative academic grader. Do not claim full curriculum retrieval, persistent AI sessions, or evaluation quality beyond implemented behavior.
- Pyodide runs learner Python in a browser Web Worker with local assets. Keep code size and execution time bounded, keep network APIs unavailable to learner code, and describe worker isolation accurately; it is not a hardened server-side execution service.
- Preview diagnostics, code checks, lab results and passport evidence are browser-local and are not synced to a student account. Do not call the Skills Passport a verified credential, certificate or accreditation.
- Do not claim accreditation, a complete CS101 course, staff administration or production readiness.
- Environment: Node 22+, `.env.local` from `.env.example` for connected Supabase. No secrets or local learner data in Git.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
