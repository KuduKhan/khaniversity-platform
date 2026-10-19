"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Target,
  Braces,
} from "lucide-react";
import { courseModules } from "@/modules/academics/curriculum";
import { enroll } from "@/modules/enrollments/actions";
import {
  emptyState,
  usePreviewRecord,
  savePreview,
  type LearningState,
} from "./preview-store";
export function Dashboard({
  preview,
  initial = emptyState,
}: {
  preview: boolean;
  initial?: LearningState;
}) {
  const [remote, setState] = useState(initial);
  const local = usePreviewRecord();
  const state = preview ? local.state : remote;
  const ready = !preview || local.ready;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const base = preview ? "/preview" : "";
  const completedModules = courseModules.filter((module, index) =>
    index === 0
      ? state.completed
      : (state.moduleProgress?.[module.id]?.score ?? 0) >= 80,
  ).length;
  const nextModule = courseModules.find((module, index) =>
    index === 0
      ? !state.completed
      : (state.moduleProgress?.[module.id]?.score ?? 0) < 80,
  ) ?? courseModules[courseModules.length - 1];
  const moduleHref = (id: string) => `${base}/learn/cs101/${id}`;
  async function join() {
    setBusy(true);
    setError("");
    try {
      if (preview) {
        const next = { ...state, enrolled: true };
        savePreview(next);
        setState(next);
      } else {
        const result = await enroll();
        if (result.error) setError(result.error);
        else setState({ ...state, enrolled: true });
      }
    } catch {
      setError(
        "We could not save enrollment. Check browser storage or your connection.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR LEARNING JOURNEY</p>
          <h1>A good day to begin.</h1>
          <p>Small steps. Clear understanding. Lasting progress.</p>
        </div>
      </div>
      <section className="welcome-panel">
        <div>
          <span className="tag">COMPUTER SCIENCE ACADEMY</span>
          <h2>
            {state.completed
              ? "Your foundation is taking shape."
              : state.enrolled
                ? "Keep your curiosity moving."
                : "Your next chapter starts here."}
          </h2>
          <p>
            {state.completed
              ? "Your learning is taking shape. Continue through the full CS101 pathway and build your capstone."
              : "A complete pathway from computational thinking to a tested Personal Study Planner. Pick up at any module and build toward mastery."}
          </p>
          {state.enrolled ? (
            <Link
              className="button gold"
              href={moduleHref(nextModule.id)}
            >
              {completedModules === courseModules.length ? "Review your capstone" : "Continue learning"}{" "}
              <ArrowRight size={17} />
            </Link>
          ) : (
            <button
              className="button gold"
              onClick={join}
              disabled={busy || !ready}
            >
              {busy ? "Enrolling…" : "Enroll in CS101"} <ArrowRight size={17} />
            </button>
          )}
          <p role="status" className="save-error">
            {error}
          </p>
        </div>
        <div className="welcome-art" aria-hidden>
          <Braces size={92} strokeWidth={0.8} />
          <span>CS / 101</span>
        </div>
      </section>
      <div className="stats">
        <article>
          <BookOpen size={20} />
          <span>Enrolled courses</span>
          <strong>{state.enrolled ? "01" : "00"}</strong>
          <small>Computer Science Foundations</small>
        </article>
        <article>
          <Check size={20} />
          <span>Lessons completed</span>
          <strong>
            {completedModules}<em> / 10 modules</em>
          </strong>
          <small>CS101 modules mastered</small>
        </article>
        <article>
          <Target size={20} />
          <span>Knowledge check</span>
          <strong>{state.score === null ? "—" : `${state.score}%`}</strong>
          <small>
            {state.score === null
              ? "Ready when you are"
              : state.completed
                ? "Foundation check passed"
                : "Revisit the lesson and try again"}
          </small>
        </article>
      </div>
      <div className="dashboard-columns">
        <section className="learning-path">
          <div className="section-heading">
            <h2>Your learning path</h2>
            <span className="muted">CS101</span>
          </div>
          <div className="path-card">
            <div className="path-card-head">
              <span className="course-icon">
                <Braces size={24} />
              </span>
              <div>
                <span className="eyebrow">COMPUTER SCIENCE FOUNDATIONS</span>
                <h3>Introduction to Computer Science & Python</h3>
              </div>
            </div>
            <div className="progress-label">
              <span>{completedModules === 10 ? "CS101 pathway mastered" : "Your progress"}</span>
              <strong>{completedModules} / 10 modules mastered</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${completedModules * 10}%` }} />
            </div>
            <div className="path-modules-list">
              {courseModules.map((module, index) => {
                const score = index === 0 ? state.score : state.moduleProgress?.[module.id]?.score;
                const passed = index === 0 ? state.completed : (score ?? 0) >= 80;
                return (
                  <div className="path-module" key={module.id}>
                    <span className="module-number">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <small>MODULE {String(index + 1).padStart(2, "0")}{module.project ? " · CAPSTONE" : " · LESSON"}</small>
                      <h3>{module.title}</h3>
                      <p><Clock3 size={13} /> {module.project ? "90" : index === 0 ? "15" : "35"} min <span>·</span> Lesson + check</p>
                    </div>
                    {passed && <span className="module-score"><Check size={14} /> {score ?? 100}%</span>}
                    <Link className="round-link" aria-label={`Open ${module.title} lesson`} href={moduleHref(module.id)}>
                      <ArrowRight size={19} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <aside className="right-rail">
          <div className="study-note">
            <span className="eyebrow">A NOTE FOR YOUR JOURNEY</span>
            <h3>Build skills through practice.</h3>
            <p>
              You don’t need to know everything to begin. You just need a place
              to start.
            </p>
            <Link href="/catalog/cs101">
              View the complete CS101 pathway <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
      <div className="workspace-footer">
        LEARN. BUILD. INNOVATE. MASTER.
        <span>KHANIVERSITY · VIRTUAL UNIVERSITY</span>
      </div>
    </div>
  );
}
