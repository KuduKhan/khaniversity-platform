import test from "node:test";
import assert from "node:assert/strict";
import {
  PRACTICE_STEP_COUNT,
  practiceChallenges,
  getPracticeChallenge,
  evaluatePractice,
  normalizePracticeAnswer,
  emptyPracticeRecord,
  parsePracticeRecord,
  practiceStorageKey,
  practiceSummary,
  savePracticeResult,
} from "../../src/modules/academics/practice-studio";
import { courseModules } from "../../src/modules/academics/curriculum";

const today = "2026-10-24T12:00:00.000Z";

test("there is one complete, distinct tracing activity for each CS101 module", () => {
  assert.equal(practiceChallenges.length, 10);
  assert.equal(new Set(practiceChallenges.map(c => c.moduleId)).size, 10);
  assert.deepEqual(practiceChallenges.map(c => c.moduleId), courseModules.map(c => c.id));
  for (const challenge of practiceChallenges) {
    assert.equal(challenge.steps.length, PRACTICE_STEP_COUNT);
    assert.ok(challenge.goal.length > 10);
    assert.ok(challenge.example.length > 12);
    for (const step of challenge.steps) {
      assert.ok(step.hint.length > 10);
      assert.ok(step.explanation.length > 10);
      assert.ok(step.answer.length > 0);
    }
    assert.equal(getPracticeChallenge(challenge.moduleId)?.title, challenge.title);
  }
});

test("every authored practice activity accepts its verified example answers", () => {
  for (const challenge of practiceChallenges) {
    const result = evaluatePractice(challenge.moduleId, challenge.steps.map(step => step.answer));
    assert.equal(result.correct, 2, challenge.moduleId);
    assert.ok(result.feedback.every(step => step.correct), challenge.moduleId);
  }
});

test("practice feedback is deterministic and does not treat wrong input as a success", () => {
  const incorrect = evaluatePractice("computational-thinking", ["9999", "99"]);
  assert.equal(incorrect.correct, 0);
  assert.match(incorrect.feedback[0].message, /Start with 0/);
  const partial = evaluatePractice("computational-thinking", ["70", "5"]);
  assert.equal(partial.correct, 1);
  assert.equal(partial.total, 2);
  assert.throws(() => evaluatePractice("unknown", ["1","2"]));
  assert.throws(() => evaluatePractice("collections", ["35"]));
});

test("number and text normalization supports meaningful input without evaluating code", () => {
  assert.equal(normalizePracticeAnswer(" 00070 ", "number"), "70");
  assert.equal(normalizePracticeAnswer("  KEYerror ", "text"), "keyerror");
  assert.equal(normalizePracticeAnswer("x + 1", "number"), null);
  assert.equal(normalizePracticeAnswer("1.0", "number"), null);
  assert.equal(normalizePracticeAnswer("alert(1)", "text"), null);
  assert.equal(normalizePracticeAnswer("9".repeat(121), "text"), null);
  const normalized = evaluatePractice("files-exceptions-debugging", ["25", "keyerror"]);
  assert.equal(normalized.correct, 2);
});

test("malformed or modified browser practice records are ignored", () => {
  assert.deepEqual(parsePracticeRecord("garbage"), emptyPracticeRecord());
  assert.deepEqual(parsePracticeRecord('{"version":2,"attempts":{}}'), emptyPracticeRecord());
  const altered = {
    version: 1,
    attempts: {
      collections: {
        moduleId: "collections", version: 1, attempts: -1,
        bestCorrect: 2, lastCorrect: 2, lastAttemptAt: today, completedAt: today,
      },
    },
  };
  assert.deepEqual(parsePracticeRecord(JSON.stringify(altered)), emptyPracticeRecord());
});

test("saved best practice survives a lower retry, and never becomes a credential", () => {
  const first = savePracticeResult(emptyPracticeRecord(), "collections", 2, today);
  const second = savePracticeResult(first, "collections", 0, today);
  const history = parsePracticeRecord(JSON.stringify(second));
  assert.equal(history.attempts.collections.attempts, 2);
  assert.equal(history.attempts.collections.bestCorrect, 2);
  assert.equal(history.attempts.collections.lastCorrect, 0);
  assert.equal(history.attempts.collections.completedAt, today);
  assert.deepEqual(Object.keys(history), ["version", "attempts"]);
});

test("preview and student practice storage never collide", () => {
  const first = "12345678-1234-4234-8234-123456789abc";
  const second = "abcd1234-1234-4234-8234-123456789abc";
  assert.notEqual(practiceStorageKey("preview"), practiceStorageKey(first));
  assert.notEqual(practiceStorageKey(first), practiceStorageKey(second));
  assert.throws(() => practiceStorageKey("student@example.com"));
});

test("practice summary finds a next skill and revision candidates", () => {
  const one = savePracticeResult(emptyPracticeRecord(), "computational-thinking", 2, today);
  const two = savePracticeResult(one, "programming-fundamentals", 1, today);
  const summary = practiceSummary(two);
  assert.equal(summary.attempted, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.total, 10);
  assert.equal(summary.next.moduleId, "programming-fundamentals");
  assert.deepEqual(summary.revisit.map(item => item.moduleId), ["programming-fundamentals"]);
  assert.throws(() => savePracticeResult(two, "collections", 3, today));
});
