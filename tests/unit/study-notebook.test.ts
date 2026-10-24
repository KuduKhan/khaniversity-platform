import test from "node:test";
import assert from "node:assert/strict";
import {
  NOTE_LIMIT,
  emptyStudyRecord,
  markNoteReviewed,
  nextReviewAt,
  parseStudyRecord,
  removeStudyNote,
  studyReviewQueue,
  studyStorageKey,
  upsertStudyNote,
} from "../../src/modules/academics/study-notebook";

const account = "12345678-1234-4234-8234-123456789abc";
const now = "2026-10-24T10:00:00.000Z";
const day = 86400000;

test("personal notes are separated by preview and signed-in account", () => {
  assert.notEqual(studyStorageKey("preview"), studyStorageKey(account));
  assert.notEqual(studyStorageKey(account), studyStorageKey("abcd1234-1234-4234-8234-123456789abc"));
  assert.throws(() => studyStorageKey("anonymous"));
});

test("invalid or outdated notebook data fails closed without crashing", () => {
  assert.deepEqual(parseStudyRecord("bad-json"), emptyStudyRecord());
  assert.deepEqual(parseStudyRecord(JSON.stringify({version: 2, notes: {}})), emptyStudyRecord());
  assert.deepEqual(parseStudyRecord('{"version":1,"notes":null}'), emptyStudyRecord());
  assert.deepEqual(parseStudyRecord("x".repeat(180001)), emptyStudyRecord());
});

test("save, reload and clear a reflection without academic progress changes", () => {
  const saved = upsertStudyNote(emptyStudyRecord(), "computational-thinking", "  Inputs become outputs.  ", "practicing", now);
  assert.equal(saved.notes["computational-thinking"].text, "Inputs become outputs.");
  const loaded = parseStudyRecord(JSON.stringify(saved));
  assert.deepEqual(loaded, saved);
  assert.deepEqual(removeStudyNote(loaded, "computational-thinking"), emptyStudyRecord());
});

test("an invalid note cannot be persisted through the notebook model", () => {
  assert.throws(() => upsertStudyNote(emptyStudyRecord(), "computational-thinking", "", "revisit"));
  assert.throws(() => upsertStudyNote(emptyStudyRecord(), "computational-thinking", "x".repeat(NOTE_LIMIT + 1), "confident"));
  assert.throws(() => upsertStudyNote(emptyStudyRecord(), "../../admin", "hello", "confident"));
  assert.throws(() => upsertStudyNote(emptyStudyRecord(), "computational-thinking", "hello", "unverified" as never));
});

test("review queue respects confidence intervals and reviewed acknowledgements", () => {
  let saved = upsertStudyNote(emptyStudyRecord(), "computational-thinking", "Need more practice", "revisit", now);
  saved = upsertStudyNote(saved, "functions-scope", "Practice parameters", "practicing", now);
  saved = upsertStudyNote(saved, "collections", "Strong on dictionaries", "confident", now);
  assert.deepEqual(studyReviewQueue(saved, Date.parse(now)).map((n) => n.moduleId), ["computational-thinking"]);
  const acknowledged = markNoteReviewed(saved, "computational-thinking", now);
  assert.deepEqual(studyReviewQueue(acknowledged, Date.parse(now)), []);
  assert.equal(nextReviewAt(acknowledged.notes["computational-thinking"]), Date.parse(now) + day);
  assert.deepEqual(studyReviewQueue(acknowledged, Date.parse(now) + day * 3).map((n) => n.moduleId),
    ["computational-thinking", "functions-scope"]);
  assert.equal(studyReviewQueue(saved, Date.parse(now) + day * 14).length, 3);
});

test("corrupt and oversized individual notes are dropped without dropping valid notes", () => {
  const saved = upsertStudyNote(emptyStudyRecord(), "collections", "Useful list operations", "confident", now);
  const raw = JSON.parse(JSON.stringify(saved));
  raw.notes["../../bad"] = { moduleId: "../../bad", text: "not allowed", confidence: "revisit", updatedAt: now, reviewedAt: null };
  raw.notes["functions-scope"] = { moduleId: "functions-scope", text: "x".repeat(NOTE_LIMIT + 1), confidence: "confident", updatedAt: now, reviewedAt: null };
  const result = parseStudyRecord(JSON.stringify(raw));
  assert.deepEqual(Object.keys(result.notes), ["collections"]);
});
