import "server-only";
import { database } from "@/lib/database/server";

export type ApprovedMaterial = { id: number; title: string; body: string; base_content_version: string };
export async function latestApprovedMaterial(lessonId: string): Promise<ApprovedMaterial | null> {
  const db = await database();
  const { data, error } = await db.from("lesson_revisions")
    .select("id,title,body,base_content_version")
    .eq("course_id", "cs101").eq("lesson_id", lessonId).eq("status", "published")
    .order("id", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("Approved teaching materials are not available.");
  return data as ApprovedMaterial | null;
}
