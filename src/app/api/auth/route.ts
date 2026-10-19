import { NextResponse } from "next/server";
import { database, configured } from "@/lib/database/server";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!configured())
    return NextResponse.json(
      {
        error:
          "Student accounts are not connected yet. You can explore the local preview.",
      },
      { status: 503 },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { email, password, mode } = body;
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128 ||
    !["signin", "signup"].includes(mode)
  )
    return NextResponse.json(
      { error: "Use a valid email and a password of 12–128 characters." },
      { status: 400 },
    );
  const db = await database();
  const { data, error } =
    mode === "signup"
      ? await db.auth.signUp({ email, password })
      : await db.auth.signInWithPassword({ email, password });
  if (error)
    return NextResponse.json(
      {
        error:
          mode === "signin"
            ? "Unable to sign in. Check your details or confirm your email."
            : "Unable to create an account. Try again later.",
      },
      { status: 400 },
    );
  return NextResponse.json({
    redirect: data.session ? "/dashboard" : null,
    message: "Check your email to confirm your account, then sign in.",
  });
}
