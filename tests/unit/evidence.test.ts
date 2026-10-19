import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountEvidence } from "../../src/modules/academics/evidence";

test("account Skills Passport maps only published CS101 modules and respects newest rows", () => {
  const rows = [
    { lesson_id: "computational-thinking", content_version: "0.1.0", score: 80, completed: true, updated_at: "2026-10-19T12:00:00Z" },
    { lesson_id: "computational-thinking", content_version: "0.0.1", score: 40, completed: false, updated_at: "2026-10-18T12:00:00Z" },
    { lesson_id: "programming-fundamentals", content_version: "1.0.0", score: 60, completed: false, updated_at: "2026-10-19T13:00:00Z" },
    { lesson_id: "unknown-lesson", content_version: "1.0.0", score: 100, completed: true, updated_at: "2026-10-19T13:00:00Z" },
  ];
  const result = buildAccountEvidence(rows);
  assert.equal(result.length, 2);
  assert.deepEqual(result.map(r => r.score), [80,60]);
  assert.equal(result[0].mastered, true);
  assert.equal(result[1].mastered, false);
});
