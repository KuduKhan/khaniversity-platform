import { AdaptivePath } from "@/components/learning-tools";
import { StudentShell } from "@/components/student-shell";
import { requireStudent } from "@/lib/database/server";

export const dynamic = "force-dynamic";

export default async function AdaptivePathPage() {
  const { email, db, id } = await requireStudent();
  const {data,error}=await db.from("learning_diagnostics")
    .select("score,topic_scores,created_at").eq("user_id",id).eq("course_id","cs101")
    .order("created_at",{ascending:false}).limit(1).maybeSingle();
  if (error) throw new Error("Unable to load your private learning diagnostic.");
  return <StudentShell preview={false} active="diagnostic" email={email}><AdaptivePath preview={false} initialResult={data ? {
    score:data.score,byTopic:data.topic_scores as Record<string,number>,completedAt:data.created_at
  } : undefined} /></StudentShell>;
}
