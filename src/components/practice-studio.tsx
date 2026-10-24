"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, CheckCircle2, Code2, Compass, RotateCcw, Sparkles } from "lucide-react";
import {
  evaluatePractice,
  getPracticeChallenge,
  parsePracticeRecord,
  practiceStorageKey,
  practiceSummary,
  savePracticeResult,
  type PracticeEvaluation,
  type PracticeRecord,
} from "@/modules/academics/practice-studio";
import styles from "./practice-studio.module.css";

const changed = "khaniversity-practice-changed";

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changed, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changed, notify);
  };
}

function usePracticeRecord(scope: string) {
  const key = useMemo(() => practiceStorageKey(scope), [scope]);
  const read = useCallback(() => {
    try { return localStorage.getItem(key) ?? ""; }
    catch { return ""; }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const record = useMemo(() => parsePracticeRecord(raw), [raw]);

  const update = useCallback(
    (apply: (record: PracticeRecord) => PracticeRecord): string | null => {
      try {
        const original = parsePracticeRecord(localStorage.getItem(key));
        const next = apply(original);
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event(changed));
        return null;
      } catch {
        return "Your browser could not save this exercise. You may still retry, but local history may not persist.";
      }
    },
    [key],
  );
  return { ready, record, update };
}

export function PracticeStudio({
  moduleId,
  scope,
  preview,
}: {
  moduleId: string;
  scope: string;
  preview: boolean;
}) {
  const challenge = getPracticeChallenge(moduleId);
  const { ready, record, update } = usePracticeRecord(scope);
  const [answers, setAnswers] = useState(["", ""]);
  const [result, setResult] = useState<PracticeEvaluation | null>(null);
  const [message, setMessage] = useState("");
  if (!challenge) return null;
  const saved = record.attempts[moduleId];
  const base = preview ? "/preview" : "";
  const allFilled = answers.every((answer) => !!answer.trim());

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!allFilled || !challenge) return;
    const checked = evaluatePractice(challenge.moduleId, answers);
    setResult(checked);
    setMessage(
      update((current) => savePracticeResult(current, challenge.moduleId, checked.correct)) ??
      (checked.correct === checked.total
        ? "Both checkpoints passed. This local practice is complete."
        : "Practice checked. Review your hints and try again."),
    );
  }

  function retry() {
    setAnswers(["", ""]);
    setResult(null);
    setMessage("");
  }

  return (
    <section id={"practice-studio-" + moduleId} className={styles.card}
      aria-labelledby={"practice-title-" + moduleId}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}><Sparkles size={16} aria-hidden="true" /> LEARNING STUDIO · GUIDED PRACTICE</span>
          <h2 id={"practice-title-" + moduleId}>{challenge.title}</h2>
          <p>{challenge.goal}</p>
        </div>
        <div className={styles.label}>02 CHECKPOINTS</div>
      </header>

      <div className={styles.example} aria-label="Practice example">
        <div className={styles.exampleHead}><Code2 size={16} aria-hidden="true" />
          <strong>Read the example</strong><span>Reason about the output</span></div>
        <pre><code>{challenge.example}</code></pre>
      </div>

      <form onSubmit={submit}>
        <div className={styles.steps}>
          {challenge.steps.map((step, index) => (
            <fieldset key={step.prompt} className={styles.step}>
              <legend><span>{String(index + 1).padStart(2, "0")}</span> {step.prompt}</legend>
              <label htmlFor={"trace-" + moduleId + "-" + index}>Your answer</label>
              <input
                id={"trace-" + moduleId + "-" + index}
                type="text"
                autoComplete="off"
                maxLength={120}
                inputMode={step.kind === "number" ? "numeric" : "text"}
                value={answers[index]}
                disabled={result !== null || !ready}
                placeholder={step.kind === "number" ? "Enter a whole number" : "Enter a short answer"}
                onChange={(event) => {
                  setAnswers((previous) => previous.map((answer, i) => i === index ? event.target.value : answer));
                  setMessage("");
                }}
              />
              <details className={styles.hint}>
                <summary>Need a hint?</summary>
                <p>{step.hint}</p>
              </details>
              {result && (
                <p className={result.feedback[index].correct ? styles.correct : styles.improve}>
                  {result.feedback[index].correct ? "✓ Correct. " : "Keep working. "}
                  {result.feedback[index].message}
                </p>
              )}
            </fieldset>
          ))}
        </div>
        <div className={styles.actions}>
          {!result ? (
            <button className="button gold" type="submit" disabled={!ready || !allFilled}>
              Check my reasoning <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button className="button outline" type="button" onClick={retry}>
              <RotateCcw size={16} aria-hidden="true" /> Try again
            </button>
          )}
          <Link className={styles.link} href={base + "/codelab"}>Practice Python in CodeLab <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </form>

      {result && <div className={styles.result} role="status">
        <CheckCircle2 size={19} aria-hidden="true" />
        <div><strong>{result.correct} of {result.total} checkpoints correct</strong>
          <p>{message}</p></div>
      </div>}
      {saved && <p className={styles.saved}>Local history: {saved.attempts} {saved.attempts === 1 ? "attempt" : "attempts"} · best {saved.bestCorrect} of 2{saved.completedAt ? " · both checkpoints completed" : ""}</p>}
      <p className={styles.disclosure}>Ungraded practice in this browser. It does not run Python or affect official module checks, faculty review, Skills Passport awards or credentials. Your learning history stays on this device.</p>
    </section>
  );
}

export function PracticeProgressPanel({ scope, preview }: { scope: string; preview: boolean }) {
  const { ready, record } = usePracticeRecord(scope);
  const summary = practiceSummary(record);
  const base = preview ? "/preview" : "";
  return (
    <section className={styles.dashboardPanel} aria-labelledby="studentos-practice-title">
      <div className={styles.dashboardHead}>
        <div>
          <span className={styles.eyebrow}><Compass size={16} aria-hidden="true" /> STUDENTOS · PRACTICE TRACKER</span>
          <h2 id="studentos-practice-title">Turn reading into reasoning.</h2>
          <p>Ten hands-on exercises, each with two self-check checkpoints.</p>
        </div>
        <strong className={styles.counter}>{ready ? summary.passed : "—"} <small>/ 10 practiced</small></strong>
      </div>
      <div className={styles.track} role="progressbar" aria-label="Local CS101 practice activities passed" aria-valuemin={0} aria-valuemax={summary.total} aria-valuenow={ready ? summary.passed : 0}>
        <span style={{ width: (ready ? summary.passed / summary.total * 100 : 0) + "%" }} />
      </div>
      {ready ? (
        <div className={styles.dashboardBottom}>
          <div>
            <strong>{summary.passed === summary.total ? "Revisit any lesson" : "Next practice activity"}</strong>
            <p>{summary.next.title}</p>
            <small>{summary.attempted} attempted · {summary.passed} finished · {summary.revisit.length} to revisit</small>
          </div>
          <Link className="button outline" href={base + "/learn/cs101/" + summary.next.moduleId + "#practice-studio-" + summary.next.moduleId}>
            {summary.passed === summary.total ? "Review practice" : "Start practice"} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : <p className={styles.saved}>Loading personal practice…</p>}
      <p className={styles.disclosure}>Local practice tracking is separate from accredited qualifications and official student assessments.</p>
    </section>
  );
}
