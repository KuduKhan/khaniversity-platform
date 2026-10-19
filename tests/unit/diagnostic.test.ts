import { test } from "node:test";
import assert from "node:assert/strict";
import {
  diagnosticQuestions,
  gradeDiagnostic,
} from "../../src/modules/academics/diagnostic";

test("diagnostic scores each topic and validates the complete response", () => {
  const result = gradeDiagnostic([0, 1, 1, 0, 1, 0]);
  assert.equal(diagnosticQuestions.length, 6);
  assert.equal(result.score, 100);
  assert.equal(Object.keys(result.byTopic).length, 6);
  assert.throws(() => gradeDiagnostic([0, 1]), /all six questions/i);
  assert.throws(
    () => gradeDiagnostic([0, 1, 1, 0, 1, 3]),
    /all six questions/i,
  );
});

test("diagnostic rejects sparse arrays with unanswered questions", () => {
  const answers = new Array<number>(6);
  answers[5] = 1;
  assert.throws(() => gradeDiagnostic(answers), /Answer all six questions/);
});
