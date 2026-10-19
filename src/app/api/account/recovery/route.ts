import { NextResponse } from "next/server";
import { configured, database } from "@/lib/database/server";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!configured())
    return NextResponse.json({ error: "Account recovery is not configured." }, { status: 503 });
  let body: { email?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  try {
    const db = await database();
    // Avoid disclosing whether an address has an account.
    await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
  } catch {
    // Network and identity errors must not enumerate learners.
  }
  return NextResponse.json({ message: "If this address has an account, recovery instructions will be sent." });
}
