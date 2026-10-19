import { NextResponse } from "next/server";
import { database, configured } from "@/lib/database/server";

// Supabase PKCE email confirmation and recovery codes are exchanged on the server.
// Do not accept arbitrary redirect destinations from email links.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next");
  const next = requested === "/reset-password" ? "/reset-password" : "/dashboard";
  if (!configured() || !code || code.length > 1024)
    return NextResponse.redirect(new URL("/signin?auth=invalid", url.origin), 303);

  try {
    const db = await database();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin), 303);
  } catch {
    // Invalid, expired and interrupted flows all return to sign in.
  }
  return NextResponse.redirect(new URL("/signin?auth=invalid", url.origin), 303);
}
