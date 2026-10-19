import { courseModules } from "./curriculum";

export type AccountEvidence = {
  id: string;
  label: string;
  score: number;
  mastered: boolean;
  completedAt: string;
};

export type ProgressRow = {
  lesson_id: string;
  content_version: string;
  score: number;
  completed: boolean;
  updated_at: string;
};

// Newest row is retained for each published module. Evidence is formative:
// the database is the source, but exporting JSON does not attest authenticity.
export function buildAccountEvidence(rows: ProgressRow[]): AccountEvidence[] {
  const latest = new Map<string, ProgressRow>();
  for (const row of rows) {
    if (!latest.has(row.lesson_id)) latest.set(row.lesson_id, row);
  }
  return courseModules.flatMap((lesson) => {
    const row = latest.get(lesson.id);
    if (!row) return [];
    return [{
      id: lesson.id,
      label: lesson.title,
      score: row.score,
      mastered: row.completed,
      completedAt: row.updated_at,
    }];
  });
}
