import { isSameOriginRequest } from "@/lib/security/origin";
import { NextResponse } from "next/server";
import { database } from "@/lib/database/server";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return new Response("Invalid origin", { status: 403 });
  const db = await database();
  await db.auth.signOut();
  return NextResponse.redirect(new URL("/signin", request.headers.get("origin")!), 303);
}
