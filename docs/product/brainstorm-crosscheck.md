# Original brainstorm architecture cross-check

The product follows the shared-hybrid-university model in the original KHANIVERSITY brainstorm and master development blueprint. The app is organized as one university platform with shared identity, curriculum, assessment, projects, peer learning and credentials; schools are not separate applications.

| Brainstorm commitment | Implemented structure |
| --- | --- |
| Six core learning systems | AI Professor, Adaptive Learning Engine, CodeLab, Virtual Technology Labs, Intelligent Assessment System, and Skills Passport & Certifications each have a working entry point and user-facing flow. |
| Computer Science Academy first | Six academic schools share one catalog; CS101 has ten authored modules, progression, formative checks, and a Personal Study Planner capstone. |
| Professional projects | Private learner drafts, controlled cohort sharing, peer feedback, and a weighted staff review rubric. |
| Peer learning | Staff-created cohorts, enrollment-gated invite joins, member-only discussion, project updates and one structured peer review per project. |
| Verified achievement | Staff-controlled award issuance checks module mastery and the human-reviewed capstone; the public code lookup reads the university credential register. |
| Mobile and offline access | Responsive layouts and installable PWA shell; only public pages and static resources are cacheable offline. |
| Future technology labs | Six safe deterministic scenarios now; connected cloud infrastructure is an external integration, not simulated as already provisioned. |
| Multi-school expansion | Six schools and 18 catalog entries are present; CS101 is the complete curriculum, while other entries explicitly open preview samplers. |

## Operational boundary

Local preview mode demonstrates the application without accounts. Account-backed records require the two Supabase migrations and environment variables. Tutor responses require a valid server-only AI key. Current environment configuration does not establish that email, live AI, public hosting or production cloud resources are operating. These are setup or external service dependencies, not roadmap comments in the learner interface.

## Data and trust

Formative and authoritative evidence are distinct. Preview evidence is browser-local. Authenticated module scores are computed by protected database functions with private assessment keys. Peer collaboration is cohort-scoped by row-level security. Staff membership is never self-assigned through the product. A credential appears only after the database checks course mastery and staff-reviewed project requirements.
