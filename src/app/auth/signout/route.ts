import { NextResponse } from "next/server";
import { database } from "@/lib/database/server";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response("Invalid origin", { status: 403 });
  const db = await database();
  await db.auth.signOut();
  return NextResponse.redirect(new URL("/signin", request.url), 303);
}
