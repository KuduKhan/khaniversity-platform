import { NextResponse } from "next/server";
import { getCourseModule } from "@/modules/academics/curriculum";

export const runtime = "nodejs";
const requests = new Map<string, { count: number; start: number }>();
const courseContext = `You are KHANIVERSITY Professor, a patient computer science tutor for beginner CS101. Teach through questions and short explanations. Ground answers in this lesson: computational thinking, input-process-output, decomposition, precise finite algorithms, tracing totals, and edge cases such as an empty list. Do not claim to know material outside this scope; say so and redirect to the course. Do not provide a full solution when a hint would teach better. Never request personal data. This is formative support, not grading.`;
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "The AI Professor is not configured on this server yet." },
      { status: 503 },
    );
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = requests.get(ip);
  if (entry && now - entry.start < 60_000 && entry.count >= 10)
    return NextResponse.json(
      { error: "Please wait a minute before asking another question." },
      { status: 429 },
    );
  if (!entry || now - entry.start >= 60_000)
    requests.set(ip, { count: 1, start: now });
  else entry.count++;
  let body: { messages?: unknown; moduleId?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 12_000)
      return NextResponse.json(
        { error: "That conversation is too long. Start a fresh question." },
        { status: 413 },
      );
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Send a valid question." },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(body.messages) ||
    body.messages.length < 1 ||
    body.messages.length > 8
  )
    return NextResponse.json(
      { error: "Send one to eight recent messages." },
      { status: 400 },
    );
  const requestedModule = typeof body.moduleId === "string" ? body.moduleId : "computational-thinking";
  const currentModule = getCourseModule(requestedModule);
  if (!currentModule) return NextResponse.json({ error: "Unknown CS101 lesson." }, { status: 400 });
  const messages = body.messages
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        typeof m === "object" &&
        ["user", "assistant"].includes(
          String((m as { role?: unknown }).role),
        ) &&
        typeof (m as { content?: unknown }).content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1800) }));
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return NextResponse.json(
      { error: "Ask a question to continue." },
      { status: 400 },
    );
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        instructions: courseContext + "\nCurrent module: " + currentModule.title +
          "\nLearning outcome: " + currentModule.outcome +
          "\nApproved lesson material: " + currentModule.sections.map((section) =>
            section.heading + ": " + section.body + (section.example ? "\nExample: " + section.example : "")
          ).join("\n").slice(0, 6000) +
          "\nSupport this module using only the approved material; never provide quiz answer keys or claim an official grade.",
        input: messages.map((m) => ({
          role: m.role,
          content: [{ type: "input_text", text: m.content }],
        })),
        max_output_tokens: 500,
        store: false,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("AI tutor provider rejected the request", {
        status: response.status,
        code:
          typeof data?.error?.code === "string" ? data.error.code : "unknown",
        type:
          typeof data?.error?.type === "string" ? data.error.type : "unknown",
      });
      if (response.status === 401 || data?.error?.code === "invalid_api_key")
        return NextResponse.json(
          {
            error:
              "The AI tutor connection needs administrator setup. Use the lesson guides while the service is configured.",
          },
          { status: 503 },
        );
      return NextResponse.json(
        { error: "The tutor is temporarily unavailable. Please try again." },
        { status: 502 },
      );
    }
    const text = (data.output || [])
      .flatMap(
        (item: {
          type: string;
          content?: { type: string; text?: string }[];
        }) =>
          item.type === "message"
            ? (item.content || [])
                .filter((c) => c.type === "output_text")
                .map((c) => c.text || [])
            : [],
      )
      .join("\n");
    if (!text)
      return NextResponse.json(
        { error: "The tutor could not form a response. Please try again." },
        { status: 502 },
      );
    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error(
      "AI tutor request failed",
      error instanceof Error ? error.name : "unknown",
    );
    return NextResponse.json(
      { error: "The tutor is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
