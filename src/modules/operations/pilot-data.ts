import "server-only";
import { database } from "@/lib/database/server";
import { summarizePilot, type PilotInput, type PilotSummary } from "./pilot-metrics";

// Staff role is checked by the calling route. Every source table also enforces
// course- and record-scoped Supabase RLS. We never send raw rows to the browser.
type Client = Awaited<ReturnType<typeof database>>;
type Page<T> = { data: T[] | null; error: { message: string } | null };
async function readAll<T>(query: (from: number, to: number) => PromiseLike<Page<T>>): Promise<T[]> {
  const batch = 500;
  const maximum = 10000; // fail closed rather than return misleading partial metrics
  const rows: T[] = [];
  for (let offset=0; offset<=maximum; offset+=batch) {
    const {data,error} = await query(offset,offset + batch - 1);
    if (error) throw new Error("Protected pilot analytics could not be loaded.");
    const page = data ?? [];
    if (offset === maximum && page.length) throw new Error("Cohort analytics exceeds the validated data window.");
    rows.push(...page);
    if (page.length < batch) return rows;
  }
  return rows;
}

export async function loadPilotSummary(db: Client): Promise<PilotSummary> {
  const [enrollments,progress,modules,lessons,code,capstones,reviews,revisions] = await Promise.all([
    readAll<PilotInput["enrollments"][number]>((a,b) => db.from("enrollments")
      .select("user_id,enrolled_at").eq("course_id","cs101").order("enrolled_at").order("user_id").range(a,b)),
    readAll<PilotInput["progress"][number]>((a,b) => db.from("lesson_progress")
      .select("user_id,lesson_id,content_version,completed")
      .order("user_id").order("lesson_id").order("content_version").range(a,b)),
    readAll<PilotInput["modules"][number]>((a,b) => db.from("modules")
      .select("id,title,position").eq("course_id","cs101").order("position").range(a,b)),
    readAll<PilotInput["lessons"][number]>((a,b) => db.from("lessons")
      .select("id,module_id,content_version,published").eq("published",true)
      .order("module_id").order("id").order("content_version").range(a,b)),
    readAll<PilotInput["code"][number]>((a,b) => db.from("code_submissions")
      .select("user_id,status,code_tests_passed,submitted_at").eq("course_id","cs101")
      .order("submitted_at",{ascending:false}).order("id",{ascending:false}).range(a,b)),
    readAll<PilotInput["capstones"][number]>((a,b) => db.from("capstone_submissions")
      .select("id,user_id,status,submitted_at").eq("course_id","cs101")
      .order("submitted_at",{ascending:false}).range(a,b)),
    readAll<PilotInput["reviews"][number]>((a,b) => db.from("capstone_reviews")
      .select("user_id,submission_id,score,code_tests_passed").eq("course_id","cs101")
      .order("reviewed_at",{ascending:false}).order("user_id").range(a,b)),
    readAll<PilotInput["revisions"][number]>((a,b) => db.from("lesson_revisions")
      .select("status").eq("course_id","cs101").order("id",{ascending:false}).range(a,b)),
  ]);
  if (modules.length !== 10)
    throw new Error("CS101 curriculum register is incomplete; pilot analytics are unavailable.");
  return summarizePilot({ enrollments,progress,modules,lessons,code,capstones,reviews,revisions });
}
