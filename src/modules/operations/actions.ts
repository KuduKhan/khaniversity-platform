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

export async function revokeCourseStaff(input: { userId: string; role: string }) {
  const identifier = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!input || typeof input.userId !== "string" || !identifier.test(input.userId) ||
      typeof input.role !== "string" ||
      !["instructor","reviewer","administrator"].includes(input.role))
    return { error: "Choose an existing course staff account and assigned role." };
  const { db, id } = await requireCourseStaff("cs101", ["administrator"]);
  if (id === input.userId)
    return { error: "You cannot revoke your own administrator access." };
  const { data, error } = await db.rpc("revoke_cs101_staff", {
    p_user_id: input.userId,
    p_role: input.role,
  });
  if (error || data !== true)
    return { error: "Role could not be revoked. Verify the account and your authorization." };
  revalidatePath("/admin");
  return { ok: true };
}
