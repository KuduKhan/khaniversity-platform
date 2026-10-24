/**
 * Browser-local, ungraded study reflections. These are never used to issue
 * course mastery, academic records or credentials.
 */
export const NOTEBOOK_VERSION = 1 as const;
export const NOTE_LIMIT = 4000;
export const NOTE_COUNT_LIMIT = 30;
export type Confidence = "revisit" | "practicing" | "confident";
export type StudyNote = {
  moduleId: string;
  text: string;
  confidence: Confidence;
  updatedAt: string;
  reviewedAt: string | null;
};
export type StudyRecord = {
  version: typeof NOTEBOOK_VERSION;
  notes: Record<string, StudyNote>;
};
export const emptyStudyRecord = (): StudyRecord => ({
  version: NOTEBOOK_VERSION,
  notes: {},
});

export function studyStorageKey(scope: string): string {
  if (scope === "preview") return "khaniversity:study-notebook:v1:preview";
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(scope))
    throw new Error("Study notebook requires an authenticated account identifier.");
  return "khaniversity:study-notebook:v1:account:" + scope;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function validModuleId(value: unknown): value is string {
  return typeof value === "string" &&
    value.length >= 3 && value.length <= 80 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
export function parseStudyRecord(raw: string | null): StudyRecord {
  if (!raw || raw.length > 180000) return emptyStudyRecord();
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || (data as { version?: unknown }).version !== NOTEBOOK_VERSION)
      return emptyStudyRecord();
    const supplied = (data as { notes?: unknown }).notes;
    if (!supplied || typeof supplied !== "object" || Array.isArray(supplied))
      return emptyStudyRecord();
    const notes: Record<string, StudyNote> = {};
    for (const [id, unknownNote] of Object.entries(supplied).slice(0, NOTE_COUNT_LIMIT)) {
      if (!validModuleId(id) || !unknownNote || typeof unknownNote !== "object") continue;
      const item = unknownNote as Record<string, unknown>;
      if (item.moduleId !== id || typeof item.text !== "string" ||
        item.text.length > NOTE_LIMIT || !validDate(item.updatedAt) ||
        !["revisit","practicing","confident"].includes(String(item.confidence)) ||
        (item.reviewedAt !== null && !validDate(item.reviewedAt))) continue;
      notes[id] = {
        moduleId: id,
        text: item.text,
        confidence: item.confidence as Confidence,
        updatedAt: item.updatedAt,
        reviewedAt: item.reviewedAt as string | null,
      };
    }
    return { version: NOTEBOOK_VERSION, notes };
  } catch {
    return emptyStudyRecord();
  }
}

export function upsertStudyNote(
  current: StudyRecord,
  moduleId: string,
  text: string,
  confidence: Confidence,
  timestamp = new Date().toISOString(),
): StudyRecord {
  if (!validModuleId(moduleId)) throw new Error("Invalid lesson.");
  if (!["revisit","practicing","confident"].includes(confidence))
    throw new Error("Choose a study confidence level.");
  const cleanText = text.trim();
  if (!cleanText || cleanText.length > NOTE_LIMIT)
    throw new Error("Write a reflection of no more than 4,000 characters.");
  if (!validDate(timestamp)) throw new Error("Invalid save timestamp.");
  if (!(moduleId in current.notes) && Object.keys(current.notes).length >= NOTE_COUNT_LIMIT)
    throw new Error("This notebook is full. Export or clear an old note.");
  const previous = current.notes[moduleId];
  return {
    version: NOTEBOOK_VERSION,
    notes: {
      ...current.notes,
      [moduleId]: {
        moduleId,
        text: cleanText,
        confidence,
        updatedAt: timestamp,
        reviewedAt: previous?.reviewedAt ?? null,
      },
    },
  };
}

export function markNoteReviewed(
  current: StudyRecord,
  moduleId: string,
  timestamp = new Date().toISOString(),
): StudyRecord {
  const existing = current.notes[moduleId];
  if (!existing || !validDate(timestamp)) return current;
  return {
    version: NOTEBOOK_VERSION,
    notes: {
      ...current.notes,
      [moduleId]: { ...existing, reviewedAt: timestamp },
    },
  };
}

export function removeStudyNote(current: StudyRecord, moduleId: string): StudyRecord {
  const remaining = { ...current.notes };
  delete remaining[moduleId];
  return { version: NOTEBOOK_VERSION, notes: remaining };
}

export function nextReviewAt(note: StudyNote): number {
  const days = note.confidence === "revisit" ? 0 :
    note.confidence === "practicing" ? 3 : 14;
  return Date.parse(note.reviewedAt ?? note.updatedAt) + days * 86400000;
}

export function studyReviewQueue(record: StudyRecord, now = Date.now()): StudyNote[] {
  return Object.values(record.notes)
    .filter((note) => nextReviewAt(note) <= now)
    .sort((a,b) => nextReviewAt(a) - nextReviewAt(b) || a.moduleId.localeCompare(b.moduleId));
}
