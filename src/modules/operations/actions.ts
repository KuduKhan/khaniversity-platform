"use server";
import { requireCourseStaff } from "@/lib/database/server";
import { revalidatePath } from "next/cache";

export async function assignCourseStaff(input: { email: string; role: string }) {
  if (typeof input?.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
    input.email.length > 254 || !["instructor","reviewer","administrator"].includes(input.role))
    return { error: "Enter a valid account email and an academic staff role." };
  const { db } = await requireCourseStaff("cs101", ["administrator"]);
  const { error } = await db.rpc("assign_cs101_staff", { p_email: input.email.trim(), p_role: input.role });
  if (error) return { error: "Access was not granted. Confirm the account email, verification state and administrator permissions." };
  revalidatePath("/admin");
  return { ok: true };
}
