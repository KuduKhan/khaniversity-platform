"use client";
import { useMemo, useSyncExternalStore } from "react";
export const previewKey = "khaniversity:foundation:0.2";
export type LearningState = {
  enrolled: boolean;
  completed: boolean;
  score: number | null;
  diagnostic?: import("@/modules/academics/diagnostic").DiagnosticResult;
  codeChallenges?: Record<string, { passed: boolean; completedAt: string }>;
  labs?: Record<string, { score: number; completedAt: string }>;
  moduleProgress?: Record<string, { score: number; completedAt: string }>;
  projectDraft?: { title: string; code: string; reflection: string; updatedAt: string };
  schoolCourses?: Record<string, { score: number; completedAt: string }>;
};
export const emptyState: LearningState = {
  enrolled: false,
  completed: false,
  score: null,
};
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("preview-progress", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("preview-progress", listener);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(previewKey) || "";
  } catch {
    return "";
  }
}
const serverSnapshot = () => "";
const hydrated = () => true;
const serverHydrated = () => false;
function parse(raw: string): LearningState {
  try {
    const v = JSON.parse(raw);
    return v &&
      typeof v.enrolled === "boolean" &&
      typeof v.completed === "boolean" &&
      (!v.completed ||
        (typeof v.score === "number" && v.score >= 80 && v.score <= 100))
      ? {
          enrolled: v.enrolled,
          completed: v.completed,
          score:
            typeof v.score === "number" && v.score >= 0 && v.score <= 100
              ? v.score
              : null,
          ...(v.diagnostic && typeof v.diagnostic.score === "number"
            ? { diagnostic: v.diagnostic }
            : {}),
          ...(v.codeChallenges && typeof v.codeChallenges === "object"
            ? { codeChallenges: v.codeChallenges }
            : {}),
          ...(v.labs && typeof v.labs === "object" ? { labs: v.labs } : {}),
          ...(v.moduleProgress && typeof v.moduleProgress === "object"
            ? { moduleProgress: v.moduleProgress }
            : {}),
          ...(v.projectDraft && typeof v.projectDraft === "object"
            ? { projectDraft: v.projectDraft }
            : {}),
          ...(v.schoolCourses && typeof v.schoolCourses === "object"
            ? { schoolCourses: v.schoolCourses }
            : {}),
        }
      : emptyState;
  } catch {
    return emptyState;
  }
}
export function usePreviewRecord() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ready = useSyncExternalStore(subscribe, hydrated, serverHydrated);
  return { state: useMemo(() => parse(raw), [raw]), ready };
}
export function savePreview(state: LearningState) {
  localStorage.setItem(previewKey, JSON.stringify(state));
  window.dispatchEvent(new Event("preview-progress"));
}
export function updatePreview(update: (state: LearningState) => LearningState) {
  const current = parse(snapshot());
  savePreview(update(current));
}
