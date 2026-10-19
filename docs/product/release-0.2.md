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

## External setup boundaries

The full application runs locally without cloud credentials in preview mode. Account-backed learning requires applying both ordered Supabase migrations and setting the public project URL and publishable key. Live AI requires a valid server-only provider key. Labs currently simulate infrastructure rather than provision cloud resources. Email delivery, public hosting and an institutional accreditation process are external operations and are not represented as completed.

See [the root README](../../README.md) for setup, role assignment, verification and check commands.
