# KHANIVERSITY · Virtual University Release

Independent online learning academy. Knowledge into practice, one step at a time.

KHANIVERSITY is a working, responsive learning platform organized around the original brainstorm’s six connected systems and the master blueprint’s shared university structure. It includes six school catalogs, 18 course entries, a complete ten-module CS101 pathway, capstone workflow, peer cohorts, academic review tools, and a progressive web app shell.

## Run locally

Use Node.js 22 or newer:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The no-account learner workspace is at `/preview/dashboard`; it stores activity in this browser and is clearly labeled as local evidence. The Python worker and six technology scenarios run locally. CS101 has ten authored modules with formative checks; other catalog courses open guided preview samplers, not full degree courses. The institution is independent and awards no accredited degrees.

## Connect accounts and academic services

Create a Supabase project, apply `supabase/migrations/20261018131843_foundation.sql` followed by `supabase/migrations/20261019090000_virtual_university.sql`, and copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then restart Next.js. Enable email/password sign-in and configure confirmation URLs and production SMTP before inviting learners. Account routes require a valid session; `/dashboard`, `/learn`, `/path`, `/codelab`, `/labs`, `/passport`, `/community`, and `/admin` do not trust preview browser data.

Course module checks are graded by protected database functions; private answer keys stay out of the browser. Learners can save a private capstone draft, join course cohorts, discuss work, share a project, and review peers within shared cohorts. Staff membership is granted by a trusted project administrator directly in Supabase SQL, never by a learner-facing form:

```sql
insert into public.course_staff(user_id, course_id, role)
values ('AUTH_USER_UUID', 'cs101', 'instructor');
```

Supported roles are `instructor`, `reviewer`, and `administrator`. Instructors manage cohorts and review capstones; reviewers may issue awards only after all ten modules are mastered, an instructor has recorded a passing capstone review and coding checks, and the learner has set a certificate name. The award is registered in the database and can be checked at `/verify/KH-CS101-...`. It is a university-issued internal course award, not an accredited qualification or cryptographic signature.

## Six core systems

1. **AI Professor:** lesson-grounded tutor panel, authored hints and explanations, and a bounded server-side OpenAI Responses API integration. Live answers require a valid `OPENAI_API_KEY`, a signed-in CS101 learner and verified course enrollment; authored guides remain available in public preview. Per-account in-memory throttling is not a distributed quota and must be replaced or complemented before a high-volume pilot. Tutor messages are not retained by the app.
2. **Adaptive Learning Engine:** six-question diagnostic with topic feedback and a recommended next activity. The recommendation is formative, not a validated learner model.
3. **KHANIVERSITY CodeLab:** bundled Pyodide Python in an isolated browser worker, with bounded execution and a checked beginner challenge.
4. **Virtual Technology Labs:** six interactive network, cloud, identity, storage, resilience and patching scenarios. These are simulations, not connected cloud infrastructure.
5. **Intelligent Assessment System:** formative module checks, server-graded account evidence, deterministic Python checks, and a human-reviewed capstone rubric.
6. **Skills Passport & Certifications:** browser-local evidence export plus account-visible university awards and a public database lookup when Supabase is configured. Local activity is not automatically a credential.

The preview tools remain available at `/preview/path`, `/preview/codelab`, `/preview/labs`, and `/preview/passport`. Their evidence stays in local storage even when an authenticated user opens the account route aliases; account-backed CS101 checks, drafts, peer work and issued credentials have separate database records.

## Account recovery and session verification

Students can request password recovery at `/recover`. PKCE email links return through `/auth/callback`, which exchanges the code server-side; `/reset-password` updates the password and signs the student out. Add your deployed HTTPS origin and `https://YOUR-DOMAIN/auth/callback` to Supabase Auth Redirect URLs and configure reliable SMTP. Recovery emails use neutral responses to avoid confirming account existence. Verify delivery, expiry, password update and a new sign-in with a designated test account before launch.

## The five blueprint platforms

Visit `/platforms` for the university's five original connected interfaces,
or `/admissions` for a transparent CS101 pilot entry guide.
The student portal and Learning Studio share authenticated CS101 progress.
CodeLab resumes and exports a private browser-local Python draft per account
or visitor preview, but it does not treat local code as a graded submission.
Course-authoring permissions are not self-assigned; approved staff can view a
read-only curriculum publication register at `/admin` in addition to existing
capstone review and audit workflows. See
`docs/product/release-0.2.md` for the Section 07 existing/planned data
boundary. Unimplemented blueprint tables were not installed on live Supabase.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Database policy tests use an isolated PGlite database. Browser checks cover the learning loop and responsive layouts. They do not establish that email delivery, a live Supabase project, OpenAI responses, public hosting or real cloud labs are configured.
