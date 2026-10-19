"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  diagnosticQuestions,
  gradeDiagnostic,
} from "@/modules/academics/diagnostic";
import { savePreview, updatePreview, usePreviewRecord } from "./preview-store";

export function AdaptivePath({ preview = true }: { preview?: boolean }) {
  const { state } = usePreviewRecord();
  const [accountResult, setAccountResult] = useState<ReturnType<typeof gradeDiagnostic> | undefined>();
  const [answers, setAnswers] = useState<number[]>([]);
  const result = preview ? state.diagnostic : accountResult;
  function submit() {
    const diagnostic = gradeDiagnostic(answers);
    if (preview) savePreview({ ...state, diagnostic });
    else setAccountResult(diagnostic);
  }
  const weakest =
    result &&
    Object.entries(result.byTopic).sort((a, b) => a[1] - b[1])[0]?.[0];
  const recommendation =
    weakest?.includes("Python") ||
    weakest === "Programming logic" ||
    weakest === "Testing"
      ? {
          title: `Practice ${weakest.toLowerCase()} in CodeLab.`,
          href: preview ? "/preview/codelab" : "/codelab",
          label: "Open Python CodeLab",
        }
      : {
          title: `Strengthen ${weakest?.toLowerCase()} with a worked lesson and a systems scenario.`,
          href: preview ? "/preview/learn/cs101/computational-thinking" : "/learn/cs101/computational-thinking",
          label: "Open the CS101 lesson",
        };
  return (
    <div className="tool-page">
      <p className="eyebrow">PERSONALIZED STARTING POINT</p>
      <h1>Find your next best step.</h1>
      <p className="tool-lede">
        A short, low-stakes check helps you choose where to spend your effort.
        It is not an admissions test or course grade. {preview ? "The result stays on this device." : "This diagnostic is session-only and is not saved as an academic result."}
      </p>
      {result ? (
        <section className="tool-panel">
          <span className="tag">DIAGNOSTIC COMPLETE · {result.score}%</span>
          <h2>{recommendation.title}</h2>
          <p>
            Begin with the CS101 computational thinking lesson, then practice
            Python and systems labs. Revisit this check whenever you want a
            fresh starting point.
          </p>
          <div className="topic-grid">
            {Object.entries(result.byTopic).map(([name, score]) => (
              <div key={name}>
                <strong>{name}</strong>
                <span>{score ? "Ready" : "Practice next"}</span>
              </div>
            ))}
          </div>
          <div className="tool-actions">
            <Link className="button gold" href={recommendation.href}>
              {recommendation.label} →
            </Link>
            <Link className="button outline" href={preview ? "/preview/codelab" : "/codelab"}>
              Practice Python →
            </Link>
          </div>
          <button
            className="text-button"
            onClick={() => { if (preview) savePreview({ ...state, diagnostic: undefined }); else setAccountResult(undefined); setAnswers([]); }}
          >
            Retake diagnostic
          </button>
        </section>
      ) : (
        <section className="tool-panel">
          <h2>Six questions. One useful direction.</h2>
          {diagnosticQuestions.map((q, i) => (
            <fieldset className="question" key={q.topic}>
              <legend>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {q.prompt}
              </legend>
              {q.options.map((option, j) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={j}
                    checked={answers[i] === j}
                    onChange={() =>
                      setAnswers((a) => {
                        const n = [...a];
                        n[i] = j;
                        return n;
                      })
                    }
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <button
            className="button gold"
            disabled={answers.length !== 6}
            onClick={submit}
          >
            Build my path →
          </button>
        </section>
      )}
    </div>
  );
}

type WorkerReply = {
  type: string;
  text?: string;
  error?: string;
  passed?: boolean;
};
export function CodeLab({ preview = true }: { preview?: boolean }) {
  const { state } = usePreviewRecord();
  const [code, setCode] = useState(
    "def total_minutes(durations):\n    # Return the total number of minutes\n    return sum(durations)\n",
  );
  const [status, setStatus] = useState("Starting Python…");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boot = useCallback(() => {
    worker.current?.terminate();
    const w = new Worker("/workers/python.worker.js", { type: "module" });
    worker.current = w;
    w.onmessage = (e: MessageEvent<WorkerReply>) => {
      const m = e.data;
      if (m.type === "ready") {
        setStatus("Python is ready · runs in your browser");
        return;
      }
      if (m.type === "result") {
        if (timer.current) clearTimeout(timer.current);
        setBusy(false);
        setOutput(m.text || "No output.");
        if (m.passed && preview)
          updatePreview((current) => ({
            ...current,
            codeChallenges: {
              ...current.codeChallenges,
              "total-minutes": {
                passed: true,
                completedAt: new Date().toISOString(),
              },
            },
          }));
        return;
      }
      if (m.type === "error") {
        if (timer.current) clearTimeout(timer.current);
        setBusy(false);
        setStatus("Python could not start");
        setOutput(m.error || "Worker error");
      }
    };
    w.postMessage({ type: "init" });
  }, [preview]);
  useEffect(() => {
    boot();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      worker.current?.terminate();
    };
  }, [boot]);
  function run(tests: boolean) {
    if (code.length > 6000) {
      setOutput("Keep your solution under 6,000 characters.");
      return;
    }
    setBusy(true);
    setOutput("");
    worker.current?.postMessage({ type: "run", code, tests });
    timer.current = setTimeout(() => {
      setOutput(
        "Execution took too long. The worker was stopped; simplify the code and try again.",
      );
      setBusy(false);
      boot();
    }, 8000);
  }
  function exportPython() {
    const file = new Blob([code + "\n"], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "khaniversity-cs101-total-minutes.py";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="tool-page">
      <p className="eyebrow">CS101 · HANDS-ON PRACTICE</p>
      <h1>Python CodeLab</h1>
      <p className="tool-lede">
        Write and run Python in a separate browser worker. Practice results are formative, not verified grades. Your code is not sent to the university database or AI tutor; export a copy before leaving.
      </p>
      <section className="tool-panel">
        <div className="lab-top">
          <div>
            <span className="tag">CHALLENGE 01</span>
            <h2>Sum a set of durations</h2>
            <p>
              Complete <code>total_minutes(durations)</code> so it returns the
              total number of minutes. Consider an empty list.
            </p>
          </div>
          <span className="system-status">{status}</span>
        </div>
        <textarea
          aria-label="Python editor"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="tool-actions">
          <button
            className="button outline"
            disabled={busy}
            onClick={() => run(false)}
          >
            Run code
          </button>
          <button className="button outline" type="button" onClick={exportPython}>Export .py draft</button>
          <button
            className="button gold"
            disabled={busy || !status.includes("ready")}
            onClick={() => run(true)}
          >
            {busy ? "Running checks…" : "Run challenge checks"}
          </button>
        </div>
        <pre className="code-output" aria-live="polite">
          {output ||
            "Output will appear here. Challenge checks cover typical, empty, and single-item inputs."}
        </pre>
        {preview && state.codeChallenges?.["total-minutes"]?.passed && (
          <p className="success-note">
            ✓ Challenge passed · saved to your local Skills Passport
          </p>
        )}
      </section>
    </div>
  );
}

const labDefinitions = [
  {
    id: "network",
    title: "Secure the service desk network",
    desc: "A support terminal needs secure web access. Block legacy remote login.",
    question:
      "A packet arrives on TCP port 23 (Telnet). What should the firewall do?",
    choices: ["Allow it", "Block it"],
    answer: 1,
    feedback: "Telnet sends credentials without modern encryption. Block it and use secure remote administration.",
  },
  {
    id: "cloud",
    title: "Design a private student records service",
    desc: "Choose the architecture that keeps records private while allowing the website to work.",
    question: "Where should the database sit?",
    choices: [
      "Public internet, beside the website",
      "Private network, reachable only by the API",
    ],
    answer: 1,
    feedback: "Keep student records private and allow access only through the authenticated API.",
  },
  {
    id: "identity",
    title: "Apply least-privilege access",
    desc: "A reporting service only needs to read a defined set of course metrics.",
    question: "Which permission should its service identity receive?",
    choices: ["Administrator access to every database", "Read access to the required reporting view", "Shared access using a student's password"],
    answer: 1,
    feedback: "Grant only the access the reporting task needs, and use a service identity that can be rotated.",
  },
  {
    id: "storage",
    title: "Protect learner project files",
    desc: "A project export contains personal learning records and should be shared only with its owner.",
    question: "What should the storage default be?",
    choices: ["Public listing enabled", "A permanent public link", "Private access with owner-scoped authorization"],
    answer: 2,
    feedback: "Private-by-default storage limits exposure; sharing should be explicit, scoped and revocable.",
  },
  {
    id: "recovery",
    title: "Prove a backup can restore",
    desc: "A service has nightly backups, but no one has practiced recovery.",
    question: "What is the best next resilience exercise?",
    choices: ["Perform a restore test and record recovery time", "Assume the backup is valid", "Delete the oldest backup"],
    answer: 0,
    feedback: "A restore drill verifies that backups work and measures whether recovery objectives are realistic.",
  },
  {
    id: "patching",
    title: "Respond to a critical service vulnerability",
    desc: "A public-facing service has a confirmed critical vulnerability and a vendor fix is available.",
    question: "Which response best balances urgency and control?",
    choices: ["Ignore it until the next annual review", "Assess exposure, test and deploy the fix promptly, then verify", "Publish the vulnerable endpoint for wider testing"],
    answer: 1,
    feedback: "Prioritize exposed risk, validate the fix in a controlled rollout and verify the deployed service.",
  },
];
export function TechLabs() {
  const { state } = usePreviewRecord();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const finished = useMemo(
    () => Object.keys(answers).length === labDefinitions.length,
    [answers],
  );
  function save() {
    const labs = { ...state.labs };
    for (const lab of labDefinitions)
      labs[lab.id] = {
        score: answers[lab.id] === lab.answer ? 100 : 0,
        completedAt: new Date().toISOString(),
      };
    savePreview({ ...state, labs });
  }
  return (
    <div className="tool-page">
      <p className="eyebrow">SIMULATION STUDIO · NO EXTERNAL SYSTEMS</p>
      <h1>Virtual technology labs</h1>
      <p className="tool-lede">
        Practice network security and cloud architecture in interactive,
        deterministic simulations. These are learning sandboxes, not connections
        to production infrastructure.
      </p>
      <div className="tool-grid">
        {labDefinitions.map((lab, i) => (
          <section className="tool-panel" key={lab.id}>
            <span className="tag">
              LAB 0{i + 1} · {lab.id.toUpperCase()}
            </span>
            <h2>{lab.title}</h2>
            <p>{lab.desc}</p>
            <div className="scenario-box">
              <strong>{lab.question}</strong>
              <div className="choice-stack">
                {lab.choices.map((c, j) => (
                  <label
                    key={c}
                    className={answers[lab.id] === j ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name={lab.id}
                      value={j}
                      checked={answers[lab.id] === j}
                      onChange={() =>
                        setAnswers((a) => ({ ...a, [lab.id]: j }))
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            {state.labs?.[lab.id] && (
              <p className="success-note" role="status">
                {state.labs[lab.id].score === 100
                  ? `Correct: ${lab.feedback}`
                  : "Review the security principle, then retake the scenario."}{" "}
                Saved result: {state.labs[lab.id].score}%
              </p>
            )}
          </section>
        ))}
      </div>
      <button className="button gold" disabled={!finished} onClick={save}>
        Submit lab results →
      </button>
      <p className="fine-print">
        These formative exercises do not award industry credentials or replace
        hands-on infrastructure experience.
      </p>
    </div>
  );
}

export function SkillsPassport() {
  const { state } = usePreviewRecord();
  const records = [
    ...(state.completed
      ? [
          {
            label: "Computational thinking lesson",
            date: "Lesson check",
            score: state.score ?? 0,
          },
        ]
      : []),
    ...(state.codeChallenges?.["total-minutes"]?.passed
      ? [
          {
            label: "Python: sum durations",
            date: state.codeChallenges["total-minutes"].completedAt,
            score: 100,
          },
        ]
      : []),
    ...Object.entries(state.labs || {}).map(([id, r]) => ({
      label: `Lab: ${id}`,
      date: r.completedAt,
      score: r.score,
    })),
    ...Object.entries(state.moduleProgress || {}).map(([id, result]) => ({
      label: `CS101 module: ${id}`,
      date: result.completedAt,
      score: result.score,
    })),
    ...Object.entries(state.schoolCourses || {}).map(([id, result]) => ({
      label: `School sampler: ${id}`,
      date: result.completedAt,
      score: result.score,
    })),
  ];
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            title: "KHANIVERSITY Skills Passport · local preview",
            generatedAt: new Date().toISOString(),
            verified: false,
            records,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "khaniversity-skills-passport.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="tool-page">
      <p className="eyebrow">YOUR LEARNING EVIDENCE</p>
      <h1>Skills Passport</h1>
      <p className="tool-lede">
        A portable summary of completed preview activities, saved on this
        device. It is not a verified certificate, accreditation, or credential.
      </p>
      <section className="tool-panel">
        <div className="passport-head">
          <div>
            <span className="tag">LOCAL PREVIEW RECORD</span>
            <h2>Evidence earned by doing.</h2>
            <p>
              Complete a lesson check, Python challenge, or lab to add an
              evidence item here.
            </p>
          </div>
          <button
            className="button outline"
            onClick={download}
            disabled={!records.length}
          >
            Export JSON
          </button>
        </div>
        {records.length ? (
          <div className="evidence-list">
            {records.map((r, i) => (
              <article key={`${r.label}-${i}`}>
                <span className="evidence-mark">✓</span>
                <div>
                  <strong>{r.label}</strong>
                  <small>
                    {r.date.includes("T")
                      ? new Date(r.date).toLocaleString()
                      : r.date}
                  </small>
                </div>
                <b>{r.score}%</b>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-evidence">
            No evidence recorded yet.{" "}
            <Link href="/preview/path">Take your diagnostic</Link>, or start a
            practice activity.
          </div>
        )}
        <button
          className="button outline print-button"
          onClick={() => window.print()}
        >
          Print this passport
        </button>
      </section>
    </div>
  );
}
