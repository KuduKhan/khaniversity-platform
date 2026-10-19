import { NextResponse } from "next/server";
import { configured, database } from "@/lib/database/server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!configured())
    return NextResponse.json({ error: "Accounts are not configured." }, { status: 503 });
  let body: { password?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.password !== "string" || body.password.length < 12 || body.password.length > 128)
    return NextResponse.json({ error: "Use a password of 12–128 characters." }, { status: 400 });
  const db = await database();
  const { data: identity, error: identityError } = await db.auth.getUser();
  if (identityError || !identity.user)
    return NextResponse.json({ error: "Your recovery session has expired. Request another recovery link." }, { status: 401 });
  const { error } = await db.auth.updateUser({ password: body.password });
  if (error)
    return NextResponse.json({ error: "Password change could not be completed. Please try again." }, { status: 400 });
  await db.auth.signOut();
  return NextResponse.json({ message: "Password updated. Sign in with your new password.", redirect: "/signin" });
}
