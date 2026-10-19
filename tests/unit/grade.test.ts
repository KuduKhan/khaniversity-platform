import { test } from "node:test";
import assert from "node:assert/strict";
import { grade } from "../../src/modules/assessments/grade";
test("mastery requires at least four correct answers", () => {
  assert.deepEqual(grade([1, 2, 0, 2, 1]), { score: 100, passed: true });
  assert.deepEqual(grade([0, 2, 0, 2, 1]), { score: 80, passed: true });
  assert.deepEqual(grade([0, 0, 0, 2, 1]), { score: 60, passed: false });
});
test("rejects partial, malformed and out of range submissions", () => {
  for (const value of [
    null,
    {},
    [],
    [1, 2, 0, 2],
    [1, 2, 0, 2, 9],
    [1, 2, 0, 2, "1"],
    [1, 2, 0, 2, 1.1],
  ])
    assert.throws(() => grade(value));
});
