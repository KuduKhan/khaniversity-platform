"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { completeModule, saveCapstoneDraft } from "@/modules/enrollments/actions";
import type { LearnerModule } from "@/modules/academics/transport";
import { savePreview, usePreviewRecord } from "./preview-store";

export function CourseModule({
  module,
  preview,
  initialScore = null,
  initialDraft,
}: {
  module: LearnerModule;
  preview: boolean;
  initialScore?: number | null;
  initialDraft?: { title: string; code: string; reflection: string } | null;
}) {
  const { state } = usePreviewRecord();
  // Never mix untrusted browser-local preview records with authenticated evidence.
  const existing = preview ? (state.moduleProgress?.[module.id]?.score ?? null) : initialScore;
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(-1));
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draftOverride, setDraftOverride] = useState<typeof initialDraft>(null);
  const draft = draftOverride ?? (preview ? state.projectDraft : initialDraft) ?? {
    title: "Personal Study Planner",
    code: "# Build your study planner here\n\ntasks = []\n",
    reflection: "",
    updatedAt: "",
  };
  const [draftMessage, setDraftMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (answers.some((answer) => answer < 0)) return;
    setBusy(true);
    setError("");
    try {
      if (preview) {
        const hits = module.checks.filter((q, i) => q.answer === answers[i]).length;
        const nextScore = Math.round((hits / module.checks.length) * 100);
        const next = {
          ...state,
          moduleProgress: {
            ...state.moduleProgress,
            [module.id]: {
              score: Math.max(nextScore, state.moduleProgress?.[module.id]?.score ?? 0),
              completedAt: new Date().toISOString(),
            },
          },
        };
        savePreview(next);
        setScore(nextScore);
      } else {
        const result = await completeModule(module.id, answers);
        if (result.error) setError(result.error);
        else setScore(result.score ?? null);
      }
    } catch {
      setError("Your result could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    const nextDraft = { ...draft, updatedAt: new Date().toISOString() };
    setDraftOverride(nextDraft);
    if (preview) {
      savePreview({ ...state, projectDraft: nextDraft });
      setDraftMessage("Draft saved on this device.");
    } else {
      const result = await saveCapstoneDraft(nextDraft);
      setDraftMessage(result.error ?? "Private project draft saved to your account.");
    }
  }

  const moduleIndex = module.id === "computational-thinking"
    ? 0
    : ["programming-fundamentals", "variables-data-input-output", "conditions-loops", "functions-scope", "collections", "files-exceptions-debugging", "algorithms-complexity", "testing-git-quality", "personal-study-planner-capstone"].indexOf(module.id) + 1;
  const nextModule = moduleIndex >= 0 ? (moduleIndex < 9 ? ["programming-fundamentals", "variables-data-input-output", "conditions-loops", "functions-scope", "collections", "files-exceptions-debugging", "algorithms-complexity", "testing-git-quality", "personal-study-planner-capstone"][moduleIndex] : undefined) : undefined;
  const moduleUrl = (id: string) => `${preview ? "/preview" : ""}/learn/cs101/${id}`;

  return (
    <div className="course-module-page">
      <Link className="back" href={`${preview ? "/preview" : ""}/dashboard`}>
        <ArrowLeft size={15} /> Back to your learning path
      </Link>
      <header className="module-hero">
        <p className="eyebrow">CS101 · MODULE {String(moduleIndex + 1).padStart(2, "0")} OF 10</p>
        <h1>{module.title}</h1>
        <p className="lead">{module.description}</p>
        <div className="module-outcome"><Check size={17} /> <span><strong>By the end, you can</strong> {module.outcome}</span></div>
        {existing !== null && <span className="tag">BEST CHECK · {existing}%</span>}
      </header>

      {module.sections.map((section, index) => (
        <section className="module-reading" key={section.heading}>
          <p className="eyebrow">{String(index + 1).padStart(2, "0")} / LESSON</p>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
          {section.example && <pre><code>{section.example}</code></pre>}
        </section>
      ))}

      {module.project && (
        <section className="module-project" aria-labelledby="capstone-title">
          <p className="eyebrow">PROFESSIONAL PROJECT · CAPSTONE</p>
          <h2 id="capstone-title">Build your Personal Study Planner</h2>
          <p>Keep an editable project draft as you build in Python CodeLab. A local draft is private to this browser; an assessed submission must be made from a connected student account and reviewed against the published rubric.</p>
          <label>Project name<input value={draft.title} onChange={(e) => setDraftOverride({ ...draft, title: e.target.value })} maxLength={100} /></label>
          <label>Python draft<textarea className="project-editor" value={draft.code} onChange={(e) => setDraftOverride({ ...draft, code: e.target.value.slice(0, 20000) })} spellCheck={false} /></label>
          <label>Explain one design decision<textarea value={draft.reflection} onChange={(e) => setDraftOverride({ ...draft, reflection: e.target.value.slice(0, 3000) })} maxLength={3000} rows={4} /></label>
          <button className="button outline" type="button" onClick={saveDraft}><Save size={16} /> Save project draft</button>
          {draftMessage && <small role="status">{draftMessage}</small>}
          <Link className="text-link" href={`${preview ? "/preview" : ""}/codelab`}>Continue building in Python CodeLab <ArrowRight size={16} /></Link>
        </section>
      )}

      <section className="module-check" id="check">
        <p className="eyebrow">KNOWLEDGE CHECK · 80% TO MASTER</p>
        <h2>Show what you understand.</h2>
        <p>This formative check gives immediate feedback. Account-based course results are saved by the assessment service; preview evidence remains on this device.</p>
        <form onSubmit={(e) => void submit(e)}>
          {module.checks.map((question, i) => (
            <fieldset key={question.prompt} disabled={busy}>
              <legend><span>{String(i + 1).padStart(2, "0")}</span>{question.prompt}</legend>
              {question.options.map((option, j) => (
                <label className="quiz-option" key={option}>
                  <input type="radio" name={`module-${module.id}-q-${i}`} value={j} checked={answers[i] === j} onChange={() => { setAnswers((current) => current.map((a, k) => k === i ? j : a)); setScore(null); }} />
                  {option}
                </label>
              ))}
              {score !== null && <p className="answer-feedback">{preview ? answers[i] === question.answer ? "✓ Correct. " : "Review: " : "Explanation: "}{question.explanation}</p>}
            </fieldset>
          ))}
          <button className="button gold" disabled={busy || answers.some((answer) => answer < 0)}>{busy ? "Saving result…" : "Submit knowledge check"} <ArrowRight size={17} /></button>
          <p role="alert" className="save-error">{error}</p>
        </form>
        {score !== null && <div className={`result ${score >= 80 ? "passed" : ""}`} role="status"><h3>{score}% · {score >= 80 ? "Module mastered" : "Practice and try again"}</h3><p>{score >= 80 ? "Your best result is recorded. Continue to the next module when ready." : "Review the explanations and retry. Your best result is kept."}</p></div>}
        {nextModule && <Link className="button" href={moduleUrl(nextModule)}>Continue to the next module <ArrowRight size={17} /></Link>}
        {module.project && <p className="fine-print">Course completion also requires a passing capstone review. A quiz score alone is not a certificate.</p>}
      </section>
    </div>
  );
}
