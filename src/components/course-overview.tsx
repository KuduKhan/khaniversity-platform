"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle2, Clock3, ClipboardCheck, GraduationCap } from "lucide-react";
import { courseInfo as course } from "@/modules/academics/course-outline";
import { courseOutline as courseModules } from "@/modules/academics/course-outline";
import { courseStages, estimatedCourseMinutes, getModuleGuide } from "@/modules/academics/course-guide";
import { buildLearningPlan } from "@/modules/academics/learning-plan";
import { emptyState, usePreviewRecord, type LearningState } from "./preview-store";
import styles from "./course-journey.module.css";

export function CourseOverview({
  preview,
  initial = emptyState,
}: {
  preview: boolean;
  initial?: LearningState;
}) {
  const local = usePreviewRecord();
  const state = preview ? local.state : initial;
  const ready = !preview || local.ready;
  const plan = buildLearningPlan(state);
  const base = preview ? "/preview" : "";
  const linkFor = (id: string) => `${base}/learn/cs101/${id}`;
  const nextHref = state.enrolled ? linkFor(plan.next.id) : `${base}/dashboard`;

  const milestones = [
    { label: "Discover a course", href: "/catalog", detail: "Explore the academic catalog" },
    { label: "Understand the syllabus", href: "#cs101-syllabus", detail: "Outcomes, stages and expectations" },
    { label: "Learn", href: nextHref, detail: "Read and work through your next lesson" },
    { label: "Practice", href: `${nextHref === `${base}/dashboard` ? linkFor(courseModules[0].id) : nextHref}#practice-studio-${state.enrolled ? plan.next.id : courseModules[0].id}`, detail: "Apply ideas in guided exercises" },
    { label: "Demonstrate mastery", href: `${nextHref === `${base}/dashboard` ? linkFor(courseModules[0].id) : nextHref}#check`, detail: "Complete the module knowledge check" },
    { label: "Complete the capstone", href: linkFor(courseModules[courseModules.length - 1].id), detail: "Submit your project for authorized review" },
    { label: "Review academic evidence", href: `${base}/passport`, detail: preview ? "See device-local practice evidence" : "Review account-backed evidence and award status" },
  ];

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Course breadcrumbs">
        <Link href={`${base}/dashboard`}>StudentOS</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">My Learning</span>
      </nav>
      <header className={styles.hero}>
        <p className="eyebrow">MY LEARNING · {course.id.toUpperCase()}</p>
        <h1>{course.title}</h1>
        <p>Learn the foundations of computing through one connected project: the Personal Study Planner. Study the syllabus, practice each topic, demonstrate module mastery and present your finished work for independent review.</p>
        <div className={styles.heroMeta}>
          <span><BookOpen size={16} aria-hidden="true" /> {courseModules.length} modules · 4 stages</span>
          <span><Clock3 size={16} aria-hidden="true" /> About {Math.round(estimatedCourseMinutes / 60)} hours of guided study (planning estimate)</span>
          <span><ClipboardCheck size={16} aria-hidden="true" /> Knowledge checks + reviewed capstone</span>
        </div>
        <div className={styles.heroActions}>
          <Link className="button gold" href={nextHref}>
            {state.enrolled ? (plan.hasFinishedChecks ? "Review your capstone" : "Continue my next module") : "Enroll and start learning"}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button outline" href="#cs101-syllabus">Explore syllabus</Link>
        </div>
        {ready ? (
          <div className={styles.progress}>
            <div className={styles.progressLabel}><strong>{plan.mastered} of {plan.total} module checks mastered</strong><span>{plan.percentage}%</span></div>
            <div className={styles.track} role="progressbar" aria-label="CS101 module mastery" aria-valuemin={0} aria-valuemax={plan.total} aria-valuenow={plan.mastered}>
              <span style={{ width: `${plan.percentage}%` }} />
            </div>
            <small>{preview ? "This progress is stored only on this device, not in an academic account." : "Module mastery is not an issued qualification; capstone assessment and eligibility checks remain separate."}</small>
          </div>
        ) : <p role="status">Loading local learning progress…</p>}
      </header>

      <section className={styles.journey} aria-labelledby="learner-journey-heading">
        <div className={styles.sectionHead}>
          <p className="eyebrow">ONE COHERENT STUDENT JOURNEY</p>
          <h2 id="learner-journey-heading">From discovery to verified learning evidence</h2>
        </div>
        <ol className={styles.steps}>
          {milestones.map((step, index) => (
            <li key={step.label}>
              <Link href={step.href}>
                <span className={styles.stepNum}>{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{step.label}</strong><small>{step.detail}</small></span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="cs101-syllabus" className={styles.syllabus} aria-labelledby="syllabus-heading">
        <div className={styles.sectionHead}>
          <p className="eyebrow">COURSE SYLLABUS</p>
          <h2 id="syllabus-heading">Four learning stages, one connected project</h2>
          <p>Start with concepts, move into Python, strengthen engineering habits and apply them in your capstone. Module times are suggestions for planning, not deadlines or grading criteria.</p>
        </div>
        {courseStages.map((stage) => (
          <section key={stage.id} id={`stage-${stage.id}`} className={styles.stage} aria-label={stage.title}>
            <div className={styles.stageHeader}>
              <span className={styles.stageNumber}>{stage.label}</span>
              <div>
                <h3>{stage.title}</h3>
                <p>{stage.summary}</p>
                <small><strong>By the end:</strong> {stage.outcome}</small>
              </div>
            </div>
            <ol className={styles.moduleList}>
              {stage.modules.map((module) => {
                const guide = getModuleGuide(module.id);
                if (!guide) return null;
                const score = guide.index === 0 ? state.score : state.moduleProgress?.[module.id]?.score ?? null;
                const mastered = score !== null && score >= 80;
                return (
                  <li key={module.id}>
                    <Link href={linkFor(module.id)} aria-label={`Module ${guide.index + 1}: ${module.title}`}>
                      <span className={styles.moduleIndex}>{String(guide.index + 1).padStart(2, "0")}</span>
                      <span className={styles.moduleCopy}>
                        <strong>{module.title}</strong>
                        <small>{module.outcome}</small>
                        <small className={styles.moduleMeta}>About {guide.studyMinutes} min · {guide.prerequisite ? `Builds on ${guide.prerequisite.title}` : "Start here"}</small>
                        {score !== null && <small className={styles.moduleScore}>{mastered ? "Mastered" : "Review needed"} · best check {score}%</small>}
                      </span>
                      {mastered ? <CheckCircle2 size={21} aria-label="Mastered" /> : <ArrowRight size={18} aria-hidden="true" />}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </section>

      <section className={styles.expectations} aria-labelledby="course-expectations-heading">
        <GraduationCap size={24} aria-hidden="true"/>
        <div>
          <h2 id="course-expectations-heading">What completing CS101 means</h2>
          <p>Each module has a formative knowledge check; 80% is the existing mastery threshold. A course award requires the separately approved capstone, enrollment and the published eligibility checks. Practice exercises, local notes and AI Tutor responses do not independently award a qualification.</p>
          <p>Entry guidance: beginner-friendly; the first modules introduce Python from the fundamentals. A laptop is recommended for extended coding, although the learning materials also work on supported mobile screens.</p>
          <Link className="text-link" href="/catalog/cs101">Public course description <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
