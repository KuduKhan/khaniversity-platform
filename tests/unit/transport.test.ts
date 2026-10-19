import { test } from "node:test";
import assert from "node:assert/strict";
import { getCourseModule } from "../../src/modules/academics/curriculum";
import { redactAssessmentAnswers } from "../../src/modules/academics/transport";

test("account-facing CS101 lesson props omit formative answer keys", () => {
  const lessonModule = getCourseModule("programming-fundamentals");
  assert.ok(module);
  assert.equal(lessonModule.checks.length, 5);
  assert.equal(typeof lessonModule.checks[0].answer, "number");

  const learner = redactAssessmentAnswers(lessonModule);
  assert.equal(learner.id, lessonModule.id);
  assert.equal(learner.checks.length, 5);
  for (const check of learner.checks) {
    assert.equal(Object.hasOwn(check, "answer"), false);
    assert.equal(check.options.length, 3);
  }
  assert.equal(typeof lessonModule.checks[0].answer, "number",
    "local preview curriculum must not be mutated");
});
