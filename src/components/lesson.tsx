"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Lightbulb } from "lucide-react";
import { completeLesson } from "@/modules/enrollments/actions";
import { Professor } from "./professor";
import { StudyNotebook } from "./study-notebook";
import {
  emptyState,
  usePreviewRecord,
  savePreview,
  type LearningState,
} from "./preview-store";
type LessonQuestion = {
  prompt: string;
  options: readonly string[];
  explanation: string;
  answer?: number;
};
export function Lesson({
  preview,
  scope,
  initial = emptyState,
  questions,
  approvedMaterial = null,
}: {
  preview: boolean;
  scope: string;
  approvedMaterial?: { title: string; body: string; id: number } | null;
  initial?: LearningState;
  questions: LessonQuestion[];
}) {
  const [remote, setState] = useState(initial);
  const local = usePreviewRecord();
  const state = preview ? local.state : remote;
  const ready = !preview || local.ready;
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(-1));
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const base = preview ? "/preview" : "";
  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (preview) {
        const correct = questions.filter((question, index) => question.answer === answers[index]).length;
        const evaluated = { score: Math.round((correct / questions.length) * 100), passed: correct >= 4 };
        const next = {
          ...state,
          score: Math.max(state.score ?? 0, evaluated.score),
          completed: state.completed || evaluated.passed,
        };
        savePreview(next);
        setState(next);
        setResult(evaluated);
      } else {
        const saved = await completeLesson(answers);
        if (saved.error) setError(saved.error);
        else if ("score" in saved) {
          setResult({ score: saved.score!, passed: saved.passed! });
          setState((current) => ({
            ...current,
            score: Math.max(current.score ?? 0, saved.score!),
            completed: current.completed || saved.passed!,
          }));
        }
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save progress. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <div className="lesson-page">
        <p role="status">Loading your learning record…</p>
      </div>
    );
  if (!state.enrolled)
    return (
      <div className="lesson-page">
        <p className="eyebrow">CS101 / YOUR FIRST STEP</p>
        <h1>Your first lesson is ready.</h1>
        <p className="lead">
          Start computational thinking now. This preview saves your learning
          progress on this device.
        </p>
        {preview ? (
          <button
            className="button"
            onClick={() => {
              const next = { ...state, enrolled: true };
              savePreview(next);
              setState(next);
            }}
          >
            Start the lesson <ArrowRight size={18} />
          </button>
        ) : (
          <Link className="button" href={`${base}/dashboard`}>
            Go to overview <ArrowRight size={18} />
          </Link>
        )}
      </div>
    );
  return (
    <div className="lesson-page">
      <Link className="back" href={`${base}/dashboard`}>
        <ArrowLeft size={15} /> Back to overview
      </Link>
      <div className="lesson-layout">
        <aside className="lesson-outline">
          <p className="eyebrow">MODULE 01</p>
          <h3>Computer systems & computational thinking</h3>
          <nav aria-label="Lesson contents">
            <a href="#outcomes">
              01 <span>What you’ll learn</span>
            </a>
            <a href="#thinking">
              02 <span>Think like a problem solver</span>
            </a>
            <a href="#example">
              03 <span>A worked example</span>
            </a>
            <a href="#practice">
              04 <span>Try it yourself</span>
            </a>
            <a href="#check">
              05 <span>Check your understanding</span>
            </a>
          </nav>
          <div className="lesson-version">
            CONTENT VERSION 0.1.0
            <br />
            No prerequisites · Beginner
          </div>
        </aside>
        <article className="lesson-content">
          <p className="eyebrow">CS101 / LESSON 01</p>
          <h1>
            Before the code,
            <br />
            there’s the thinking.
          </h1>
          <p className="lesson-intro">
            Computational thinking is the art of turning a messy problem into a
            solution you can explain, test, and repeat.
          </p>
          <div className="lesson-meta">
            <span>
              <Clock3 size={15} /> 15 minute lesson
            </span>
            <span>Reading + practice</span>
            {state.completed && (
              <span className="completed">
                <Check size={15} /> Completed
              </span>
            )}
          </div>
          {approvedMaterial && <section className="module-reading" aria-label="Faculty reviewed lesson material">
            <span className="eyebrow">FACULTY APPROVED · TEACHING SUPPLEMENT #{approvedMaterial.id}</span>
            <h2>{approvedMaterial.title}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{approvedMaterial.body}</p>
            <small>This material is approved teaching content; graded questions remain in the separately versioned assessment service.</small>
          </section>}
          <section id="outcomes">
            <h2>What you’ll learn</h2>
            <p>By the end of this lesson, you should be able to:</p>
            <ul>
              <li>
                Identify the inputs, processing, and outputs of a simple system.
              </li>
              <li>Break a problem into smaller parts using decomposition.</li>
              <li>Write a clear algorithm and test it with an edge case.</li>
            </ul>
          </section>
          <section id="thinking">
            <span className="eyebrow">01 / THE IDEA</span>
            <h2>A computer needs a clear plan.</h2>
            <p>
              Imagine asking a friend to organize your study week. “Make a good
              plan” leaves many questions unanswered. Which tasks matter? How
              much time is available? What counts as finished?
            </p>
            <p>
              Computers face the same difficulty. They execute precise
              instructions on data. A useful way to describe a computing task is{" "}
              <strong>input → processing → output</strong>.
            </p>
            <div className="ipo">
              <div>
                <small>INPUT</small>
                <strong>What you know</strong>
                <p>Task durations</p>
              </div>
              <ArrowRight />
              <div>
                <small>PROCESSING</small>
                <strong>What you do</strong>
                <p>Add the durations</p>
              </div>
              <ArrowRight />
              <div>
                <small>OUTPUT</small>
                <strong>What you need</strong>
                <p>Total study time</p>
              </div>
            </div>
            <p>
              <strong>Decomposition</strong> means splitting a large problem
              into smaller parts. For a study planner, you might separate
              collecting tasks, validating durations, calculating totals, and
              presenting the plan.
            </p>
            <div className="callout">
              <Lightbulb size={21} />
              <div>
                <strong>You already use algorithms.</strong>
                <p>
                  A recipe or a set of directions is a sequence of steps. A
                  computing algorithm adds precision: each step should be clear
                  enough to execute consistently, and the process should finish.
                </p>
              </div>
            </div>
          </section>
          <section id="example">
            <span className="eyebrow">02 / THE WORKED EXAMPLE</span>
            <h2>How long will today’s study take?</h2>
            <p>
              Suppose your tasks take 20, 35, and 15 minutes. Instead of jumping
              into Python, describe the solution in plain language first.
            </p>
            <pre>
              <code>
                {
                  "INPUT: task durations [20, 35, 15]\n\n1. Set total to 0.\n2. For each duration in the list:\n   Add that duration to total.\n3. Display total.\n\nOUTPUT: 70 minutes"
                }
              </code>
            </pre>
            <p>
              Trace the total after each step: <strong>0 → 20 → 55 → 70</strong>
              . This trace makes your reasoning visible and gives you a way to
              spot mistakes.
            </p>
            <h3>What if there are no tasks?</h3>
            <p>
              The loop runs zero times. The total stays at zero, so the output
              is <strong>0 minutes</strong>. This is an{" "}
              <strong>edge case</strong>: an unusual input that helps reveal
              whether your plan is robust.
            </p>
            <p>
              Negative durations need a separate rule. For this problem, reject
              them and ask for a non-negative duration. Being explicit about
              assumptions is part of building a useful algorithm.
            </p>
          </section>
          <section id="practice">
            <span className="eyebrow">03 / YOUR TURN</span>
            <h2>Make the thinking your own.</h2>
            <p>
              Write the steps for finding the longest task in a list of
              durations. Decide what should happen when the list is empty. You
              can use a notebook; this reflection is not graded.
            </p>
            <details>
              <summary>Show a scaffolded hint</summary>
              <p>
                First handle the empty list. Otherwise, keep the first duration
                as the longest so far. Compare each remaining duration with it
                and replace it when you find a larger value.
              </p>
            </details>
            <details>
              <summary>Compare your reasoning</summary>
              <p>
                For [20, 35, 15], the longest begins at 20, becomes 35, then
                stays at 35. For an empty list, report “No tasks yet” instead of
                assuming a first item exists. The important part is a clear rule
                for every supported input.
              </p>
            </details>
          </section>
          <section id="check">
            <span className="eyebrow">04 / CHECK YOUR UNDERSTANDING</span>
            <h2>A small check. A stronger foundation.</h2>
            <p>
              Answer all five questions. A score of 80% completes this
              foundation lesson. You can review the explanation and retry. This
              is a formative check, not a credential.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {questions.map((q, i) => (
                <fieldset key={q.prompt} disabled={busy}>
                  <legend>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {q.prompt}
                  </legend>
                  {q.options.map((option, j) => (
                    <label className="quiz-option" key={option}>
                      <input
                        type="radio"
                        name={`question-${i}`}
                        value={j}
                        checked={answers[i] === j}
                        required
                        onChange={() => {
                          setAnswers((a) => a.map((v, k) => (k === i ? j : v)));
                          setResult(null);
                        }}
                      />
                      {option}
                    </label>
                  ))}
                  {result && (
                    <p className="answer-feedback">
                      {preview
                        ? answers[i] === q.answer ? "✓ Correct. " : "Review: "
                        : "Explanation: "}
                      {q.explanation}
                    </p>
                  )}
                </fieldset>
              ))}
              <button className="button" disabled={busy}>
                {busy ? "Saving your check…" : "Check & save progress"}{" "}
                <ArrowRight size={18} />
              </button>
              <p role="alert" className="save-error">
                {error}
              </p>
            </form>
            {result && (
              <div
                className={`result ${result.passed ? "passed" : ""}`}
                role="status"
              >
                <h3>
                  {result.score}% ·{" "}
                  {result.passed
                    ? "Foundation lesson complete"
                    : "Keep building your understanding"}
                </h3>
                <p>
                  {result.passed
                    ? "Your progress is saved. Continue with Programming fundamentals & Python."
                    : "Review the explanations above and try again when you’re ready. Your highest score is kept."}
                </p>
                <Link className="text-link" href={`${base}/dashboard`}>
                  Return to your overview <ArrowRight size={17} />
                </Link>
              </div>
            )}
          </section>
          <StudyNotebook moduleId="computational-thinking" title="Computational thinking" scope={scope} />
          <Professor preview={preview} />
          <div className="next-lesson">
            <span className="eyebrow">NEXT / MODULE 02</span>
            <h3>Programming fundamentals & Python</h3>
            <p>
              Your first Python script starts with the thinking you practiced
              today. Continue into variables, values, and program execution.
            </p>
            <Link className="text-link" href={`${base}/learn/cs101/programming-fundamentals`}>
              Start programming fundamentals <ArrowRight size={17} />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
