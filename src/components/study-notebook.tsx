"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, BookMarked, Check, Download, NotebookPen, RotateCcw, Trash2 } from "lucide-react";
import {
  NOTE_LIMIT,
  markNoteReviewed,
  nextReviewAt,
  parseStudyRecord,
  removeStudyNote,
  studyReviewQueue,
  studyStorageKey,
  upsertStudyNote,
  type Confidence,
  type StudyRecord,
} from "@/modules/academics/study-notebook";
import styles from "./study-notebook.module.css";

const changeEvent = "khaniversity-study-notebook-changed";

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changeEvent, notify);
  };
}

function useLocalNotebook(scope: string) {
  const key = useMemo(() => studyStorageKey(scope), [scope]);
  const getSnapshot = useCallback(() => {
    try { return localStorage.getItem(key) ?? ""; }
    catch { return ""; }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const record = useMemo(() => parseStudyRecord(raw), [raw]);

  const update = useCallback((apply: (current: StudyRecord) => StudyRecord): string | null => {
    try {
      // Read again at write time so adjacent tabs do not silently overwrite an
      // older render's copy of the notebook.
      const existing = parseStudyRecord(localStorage.getItem(key));
      const updated = apply(existing);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event(changeEvent));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message :
        "The browser could not save this note. Check storage settings or available space.";
    }
  }, [key]);

  const exportNotes = useCallback((): string | null => {
    try {
      const fresh = parseStudyRecord(localStorage.getItem(key));
      const data = JSON.stringify({
        format: "khaniversity-personal-study-notebook",
        version: 1,
        source: "browser-local-ungraded",
        exportedAt: new Date().toISOString(),
        notes: Object.values(fresh.notes),
      }, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "khaniversity-study-notes.json";
      anchor.click();
      URL.revokeObjectURL(url);
      return null;
    } catch {
      return "Could not export your notebook from this browser.";
    }
  }, [key]);

  return { record, ready, update, exportNotes };
}

export function StudyNotebook({
  moduleId,
  title,
  scope,
}: {
  moduleId: string;
  title: string;
  scope: string;
}) {
  const { record, ready, update, exportNotes } = useLocalNotebook(scope);
  const note = record.notes[moduleId];
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<Confidence>("revisit");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setText(note?.text ?? "");
    setConfidence(note?.confidence ?? "revisit");
    setConfirmDelete(false);
  }, [scope, moduleId, note?.updatedAt]);

  function save(event: React.FormEvent) {
    event.preventDefault();
    const error = update((current) => upsertStudyNote(current, moduleId, text, confidence));
    setMessage(error ?? "Reflection saved on this device.");
  }

  function reviewed() {
    const error = update((current) => markNoteReviewed(current, moduleId));
    setMessage(error ?? "Review recorded locally. Your academic grades are unchanged.");
  }

  function clear() {
    const error = update((current) => removeStudyNote(current, moduleId));
    setConfirmDelete(false);
    setMessage(error ?? "Local reflection cleared.");
  }

  return (
    <section className={styles.notebook} aria-labelledby={"study-notebook-" + moduleId}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}><NotebookPen size={16} aria-hidden="true" /> LEARNING STUDIO · PERSONAL NOTEBOOK</p>
          <h2 id={"study-notebook-" + moduleId}>Make this lesson yours.</h2>
          <p>Write what you understood, what confused you, and what to practice next.</p>
        </div>
        <span className={styles.pill}>PRIVATE TO THIS BROWSER</span>
      </div>
      <form onSubmit={save} className={styles.form}>
        <label htmlFor={"study-note-text-" + moduleId}>Your reflection · {title}</label>
        <textarea
          id={"study-note-text-" + moduleId}
          rows={5}
          maxLength={NOTE_LIMIT}
          placeholder="In my own words… My next practice step is…"
          value={text}
          onChange={(event) => { setText(event.target.value); setMessage(""); }}
          disabled={!ready}
        />
        <div className={styles.formBottom}>
          <div className={styles.confidence}>
            <label htmlFor={"study-note-confidence-" + moduleId}>Confidence</label>
            <select
              id={"study-note-confidence-" + moduleId}
              value={confidence}
              onChange={(event) => setConfidence(event.target.value as Confidence)}
              disabled={!ready}
            >
              <option value="revisit">Need another look · review now</option>
              <option value="practicing">Still practicing · 3 days</option>
              <option value="confident">Confident · 14 days</option>
            </select>
          </div>
          <small>{text.length} / {NOTE_LIMIT} characters</small>
        </div>
        <div className={styles.actions}>
          <button type="submit" className="button gold" disabled={!ready || !text.trim()}>
            <Check size={16} aria-hidden="true" /> Save reflection
          </button>
          {note && (
            <button type="button" className="button outline" onClick={reviewed} disabled={!ready}>
              <RotateCcw size={16} aria-hidden="true" /> Mark as reviewed
            </button>
          )}
          <button type="button" className={styles.export} disabled={!ready || !Object.keys(record.notes).length}
            onClick={() => setMessage(exportNotes() ?? "Notebook exported as JSON.")}>
            <Download size={16} aria-hidden="true" /> Export notes
          </button>
        </div>
      </form>
      {note && (
        <div className={styles.saved}>
          <div>
            <strong><BookMarked size={16} aria-hidden="true" /> Saved study reflection</strong>
            <p>Last saved {new Date(note.updatedAt).toLocaleDateString()} · {nextReviewAt(note) <= Date.now() ? "Ready to review" : "Scheduled for review"}</p>
          </div>
          {confirmDelete ? (
            <div className={styles.deleteActions}>
              <span>Clear this saved note?</span>
              <button type="button" onClick={clear}>Yes, clear</button>
              <button type="button" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className={styles.remove} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} aria-hidden="true" /> Clear
            </button>
          )}
        </div>
      )}
      {message && <p className={styles.feedback} role="status">{message}</p>}
      <p className={styles.disclosure}>Notes are stored on this device, not synced to Supabase and not shared with faculty. On shared devices, others may access local browser data. Notes do not affect grades, mastery or credentials.</p>
    </section>
  );
}

export function StudyReviewPanel({
  scope,
  preview,
  modules,
}: {
  scope: string;
  preview: boolean;
  modules: Array<{ id: string; title: string }>;
}) {
  const { record, ready, exportNotes } = useLocalNotebook(scope);
  const [message, setMessage] = useState("");
  const courseIds = new Set(modules.map((item) => item.id));
  const due = studyReviewQueue(record).filter((note) => courseIds.has(note.moduleId));
  const count = Object.values(record.notes).filter((note) => courseIds.has(note.moduleId)).length;
  const root = preview ? "/preview" : "";

  return (
    <section className={styles.reviewPanel} aria-labelledby="studentos-notebook-title">
      <div className={styles.reviewHeader}>
        <div>
          <span className={styles.eyebrow}><NotebookPen size={16} aria-hidden="true" /> STUDENTOS · PERSONAL STUDY NOTES</span>
          <h2 id="studentos-notebook-title">Your revision desk.</h2>
          <p>{ready ? count + " lesson reflections · " + due.length + " ready for review" : "Loading your local notes…"}</p>
        </div>
        {count > 0 && <button type="button" className={styles.export} onClick={() => setMessage(exportNotes() ?? "Notebook exported.")}>
          <Download size={16} aria-hidden="true" /> Export
        </button>}
      </div>
      {!ready ? null : due.length > 0 ? (
        <ul className={styles.reviewList}>
          {due.slice(0,4).map((note) => (
            <li key={note.moduleId}>
              <span><strong>{modules.find((module) => module.id === note.moduleId)?.title ?? "CS101 lesson"}</strong><small>Review your note and revisit the lesson</small></span>
              <Link href={root + "/learn/cs101/" + note.moduleId}>Review <ArrowRight size={15} aria-hidden="true" /></Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{count ? "You are up to date. The next review appears when its interval is due." :
          "Capture your first reflection in a CS101 lesson to build a useful revision queue."}</p>
      )}
      {message && <p className={styles.feedback} role="status">{message}</p>}
      <p className={styles.disclosure}>Device-only study aids; separate from official assessment records.</p>
    </section>
  );
}
