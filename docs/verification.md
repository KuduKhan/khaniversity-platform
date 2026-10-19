# KHANIVERSITY verification · 18 October 2026

Verified locally on Node.js 24, Next.js 16.4.2 and Playwright Chromium against the optimized production build.

| Check | Result |
| --- | --- |
| ESLint and TypeScript | Pass with no warnings or errors |
| Unit and PGlite integration | 5 pass; curriculum scoring, sparse diagnostic rejection, enrollment/RLS, private assessment keys, protected score writes, and exact combined migration integrity |
| Production build | Pass; learner, peer, staff, account-tool, credential verification, catalog, and PWA routes generated |
| Playwright | 9 pass; course progression, route protection, six learning systems, all nine follow-on CS101 modules, capstone draft, 375/768/1440 px layouts, manifest and credential lookup behavior |
| Python runtime | Bundled Pyodide started in Chromium and passed the three challenge checks |
| Supabase | Migrations execute in isolated PostgreSQL-compatible PGlite; no live Supabase project was configured for this run |
| AI Professor | Authored in-page guides work; live Responses API remains unavailable until the server has a valid provider key |
| Deployment | No public deployment or remote repository push was performed |

The local production app is serving at http://127.0.0.1:3000. Account confirmation email delivery, live account workflows against Supabase, live AI, and connected cloud infrastructure were not represented as verified.
