"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FlaskConical } from "lucide-react";
import type { CourseListing } from "@/modules/academics/university";
import { savePreview, usePreviewRecord } from "./preview-store";

const learningContexts: Record<string, { concept: string; scenario: string; project: string; lab: string }> = {
  "computer-science": { concept: "Turn a problem into a model: define inputs, rules, outputs and edge cases before writing code.", scenario: "A collection of study tasks must be filtered and summarized. Decide what the program needs to know and what it should return.", project: "Build a small, testable program that solves one clearly defined user problem.", lab: "/preview/codelab" },
  "software-engineering": { concept: "Reliable software is designed around user needs, small components, explicit interfaces and observable behavior.", scenario: "A course registration form accepts malformed values. Identify validation boundaries and the feedback each user needs.", project: "Design a small web feature with an accessible form, a service boundary and meaningful automated tests.", lab: "/preview/codelab" },
  "artificial-intelligence": { concept: "An AI system learns or reasons from a defined representation, and its behavior must be evaluated against a real use case.", scenario: "A model performs well on training examples but poorly on new data. Choose the next diagnostic step before changing the model.", project: "Write an evaluation plan that includes a baseline, representative data, error analysis and a human-impact check.", lab: "/preview/labs" },
  cybersecurity: { concept: "Defensive security starts with assets, trust boundaries, realistic threats and controls that reduce exposure.", scenario: "A public service exposes an administration port. Identify the safest first response and the evidence you would preserve.", project: "Create a threat model for a small service and prioritize mitigations by risk and evidence.", lab: "/preview/labs" },
  cloud: { concept: "Cloud systems combine compute, identity, networking, storage and observability; secure defaults reduce accidental exposure.", scenario: "A private student-data service needs a public website. Place each component where least privilege can be enforced.", project: "Draw a small service architecture with identity boundaries, backup, monitoring and a recovery objective.", lab: "/preview/labs" },
  "emerging-technologies": { concept: "Physical and connected systems observe the world through sensors and act through constrained interfaces.", scenario: "A temperature sensor briefly reports an impossible value. Decide how the system should validate, record and respond.", project: "Design a safe sensing-and-control prototype with input validation, a fail-safe state and a test plan.", lab: "/preview/labs" },
};

const checks = [
  { prompt: "What is the best first step when approaching an unfamiliar technical problem?", options: ["Choose a tool before understanding the task", "Clarify the goal, constraints and available evidence", "Assume the first idea is correct"], answer: 1, explanation: "A clear model and constraints guide a suitable solution." },
  { prompt: "Why test boundary cases?", options: ["They reveal assumptions ordinary examples may miss", "They replace all normal tests", "They make requirements unnecessary"], answer: 0, explanation: "Boundary cases expose limits and invalid assumptions." },
  { prompt: "What does least privilege mean?", options: ["Give every component administrator access", "Disable access checks", "Grant only the access needed for a task"], answer: 2, explanation: "Reducing permissions limits the impact of mistakes and compromise." },
  { prompt: "What makes a project reviewable?", options: ["A screenshot without context", "A clear goal, evidence, tests and an explanation", "An untested claim"], answer: 1, explanation: "Reviewers need observable evidence and the reasoning behind it." },
  { prompt: "How should uncertain system behavior be handled?", options: ["State uncertainty and gather evidence", "Invent a confident result", "Hide the failure"], answer: 0, explanation: "Honest uncertainty helps people choose a safe next step." },
];

export function UniversityCoursePreview({ course }: { course: CourseListing }) {
  const { state } = usePreviewRecord();
  const context = learningContexts[course.schoolId] ?? learningContexts["computer-science"];
  const [answers, setAnswers] = useState<number[]>(Array(checks.length).fill(-1));
  const [score, setScore] = useState<number | null>(null);
  const existing = state.schoolCourses?.[course.id];
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = Math.round((checks.filter((check, i) => answers[i] === check.answer).length / checks.length) * 100);
    setScore(result);
    savePreview({
      ...state,
      schoolCourses: {
        ...state.schoolCourses,
        [course.id]: { score: Math.max(result, existing?.score ?? 0), completedAt: new Date().toISOString() },
      },
    });
  }
  return (
    <div className="course-module-page">
      <Link className="back" href={`/schools/${course.schoolId}`}>← Back to school</Link>
      <header className="module-hero">
        <p className="eyebrow">{course.level.toUpperCase()} · SCHOOL COURSE PREVIEW</p>
        <h1>{course.title}</h1>
        <p className="lead">{course.description}</p>
        <div className="module-outcome"><Check size={17} /><span><strong>Practice objective</strong> Build a sound first approach, test your assumptions and explain the evidence behind a decision.</span></div>
        {existing && <span className="tag">BEST CHECK · {existing.score}%</span>}
      </header>
      <section className="module-reading">
        <p className="eyebrow">01 / CONCEPT</p><h2>Begin with a clear model.</h2>
        <p>{context.concept}</p>
      </section>
      <section className="module-reading">
        <p className="eyebrow">02 / APPLIED SCENARIO</p><h2>Reason through the situation.</h2>
        <p>{context.scenario}</p>
        <Link className="text-link" href={context.lab}><FlaskConical size={16} /> Explore a safe technology lab <ArrowRight size={16} /></Link>
      </section>
      <section className="module-project">
        <p className="eyebrow">03 / PROFESSIONAL PROJECT BRIEF</p><h2>Make your reasoning visible.</h2>
        <p>{context.project}</p>
        <ul><li>State the user need and constraints.</li><li>Show a working artifact or testable model.</li><li>Include a boundary case and explain one trade-off.</li></ul>
      </section>
      <section className="module-check">
        <p className="eyebrow">FORMATIVE CHECK · PREVIEW RECORD</p><h2>Check your foundations.</h2>
        <p>This short school sampler is saved on this device. It is a learning activity, not a course completion record or professional credential.</p>
        <form onSubmit={submit}>
          {checks.map((question, i) => <fieldset key={question.prompt}><legend><span>{String(i + 1).padStart(2, "0")}</span>{question.prompt}</legend>{question.options.map((option, j) => <label className="quiz-option" key={option}><input type="radio" name={`school-${course.id}-${i}`} checked={answers[i] === j} onChange={() => setAnswers((current) => current.map((answer, k) => k === i ? j : answer))} />{option}</label>)}{score !== null && <p className="answer-feedback">{answers[i] === question.answer ? "✓ Correct. " : "Review: "}{question.explanation}</p>}</fieldset>)}
          <button className="button gold" disabled={answers.some((answer) => answer < 0)}>Save school preview check <ArrowRight size={17} /></button>
        </form>
        {score !== null && <div className={`result ${score >= 80 ? "passed" : ""}`} role="status"><h3>{score}% · {score >= 80 ? "Strong foundation" : "Review and retry"}</h3><p>Your evidence remains local to this browser preview.</p></div>}
      </section>
    </div>
  );
}
