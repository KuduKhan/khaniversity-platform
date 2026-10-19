"use client";
import { FormEvent, useState } from "react";
type Message = { role: "user" | "assistant"; content: string };
export function Professor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function showGuide(content: string) {
    setMessages((current) =>
      [...current, { role: "assistant" as const, content }].slice(-8),
    );
    setError("");
  }
  async function ask(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    const next = [
      ...messages,
      { role: "user" as const, content: prompt.trim() },
    ].slice(-8);
    setMessages(next);
    setPrompt("");
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Tutor unavailable");
      setMessages(
        [
          ...next,
          { role: "assistant" as const, content: String(data.answer) },
        ].slice(-8),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tutor unavailable");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="professor-panel" aria-label="AI Professor">
      <div className="professor-heading">
        <div>
          <span className="eyebrow">LESSON-GROUNDED SUPPORT</span>
          <h2>Ask the AI Professor</h2>
        </div>
        <span className="tag">CS101</span>
      </div>
      <p>
        Ask for a hint, an example, or a step-by-step explanation. Your chat
        stays in this tab; avoid sharing personal information.
      </p>
      <div className="professor-chat" aria-live="polite">
        {messages.length ? (
          messages.map((m, i) => (
            <div
              className={`chat-message ${m.role}`}
              key={`${i}-${m.content.slice(0, 12)}`}
            >
              <strong>{m.role === "user" ? "You" : "Professor"}</strong>
              <p>{m.content}</p>
            </div>
          ))
        ) : (
          <div className="chat-empty">
            Try: “Why does the total stay at zero when the list is empty?”
          </div>
        )}
        {busy && <div className="chat-empty">Thinking through the lesson…</div>}
      </div>
      <div className="guide-actions" aria-label="Offline lesson guides">
        <span>QUICK LESSON GUIDES</span>
        <button
          type="button"
          onClick={() =>
            showGuide(
              "Start with the empty-list case: the loop has no items to process, so no additions happen. What value should the total have before the loop begins?",
            )
          }
        >
          Hint: empty lists
        </button>
        <button
          type="button"
          onClick={() =>
            showGuide(
              "Input: the task durations. Processing: add each duration to a running total. Output: the final total in minutes.",
            )
          }
        >
          Explain input → process → output
        </button>
        <button
          type="button"
          onClick={() =>
            showGuide(
              "Break the planner into smaller steps: collect durations, reject invalid values, calculate the total, then display it. Test with a typical list and an empty one.",
            )
          }
        >
          Show a decomposition example
        </button>
      </div>
      <form onSubmit={ask} className="professor-form">
        <label className="sr-only" htmlFor="professor-question">
          Your question
        </label>
        <textarea
          id="professor-question"
          maxLength={1800}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like to understand?"
        />
        <button className="button gold" disabled={busy || !prompt.trim()}>
          {busy ? "Asking…" : "Ask"}
        </button>
      </form>
      {error && (
        <p role="alert" className="save-error">
          {error}
        </p>
      )}
      <small className="fine-print">
        AI can make mistakes. Check explanations against the lesson. Submitted
        questions are sent to the configured AI provider; offline lesson guides
        stay in this page.
      </small>
    </section>
  );
}
