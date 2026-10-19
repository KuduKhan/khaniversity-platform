# Foundation architecture

One Next.js modular monolith. Server-rendered public pages present the academic hierarchy. Client components handle interactions, while server actions authenticate and use a request-scoped Supabase SSR client. The proxy refreshes session cookies and applies private no-store caching. Every protected entry point independently verifies claims.

The academic catalog is a source-controlled publication in 0.1. Its identifiers and version are mirrored in the migration. Curriculum updates must change code, database identities and tests together. Future publishing can read versioned content from the academic module without splitting deployments.

`/preview/*` is a separate, explicitly labeled browser-only experience. It never establishes a server identity. `/dashboard` and `/learn/*` always require a verified Supabase user, regardless of preview storage. Local state is validated and storage errors surface to the learner.

Database writes: an authenticated user can insert only their own enrollment in a published course. Lesson results are read-only through the Data API. A public security-invoker RPC calls a narrow function in the non-exposed `private` schema. This function checks identity and enrollment, validates five answers, grades deterministically and preserves the highest score. Its definer privilege exists only to write the protected progress table; its fixed search path prevents object shadowing. No role-selection or arbitrary learner-id parameter exists.

Progress references `(lesson_id,content_version)`. The lesson is formative, so feedback and the matching client-side preview answer key are intentionally visible. This is not a protected high-stakes exam. Future summative exams need a separate assessment model and hidden test storage.

Operational boundary: no external resources are provisioned by the app. Deploy as a normal Next.js Node application (Vercel compatible). Set the two publishable configuration values at build/runtime; use TLS; configure Supabase redirects, SMTP, backups and abuse controls. No staff access exists in this release.
