import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
export async function database() {
  if (!configured())
    throw new Error(
      "Student accounts are not connected yet. Use the local preview.",
    );
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server Components refresh through proxy. */
          }
        },
      },
    },
  );
}
export async function requireStudent() {
  if (!configured()) redirect("/signin");
  const db = await database();
  const { data, error } = await db.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/signin");
  return { db, id: data.claims.sub, email: String(data.claims.email ?? "") };
}

export async function requireCourseStaff(
  courseId: string,
  allowed: Array<"instructor" | "reviewer" | "administrator"> = [
    "instructor",
    "reviewer",
    "administrator",
  ],
) {
  const student = await requireStudent();
  const { data, error } = await student.db
    .from("course_staff")
    .select("course_id,role")
    .eq("user_id", student.id)
    .eq("course_id", courseId);
  if (error || !data?.some((entry) => allowed.includes(entry.role)))
    redirect("/dashboard");
  return { ...student, role: data.find((entry) => allowed.includes(entry.role))!.role };
}
