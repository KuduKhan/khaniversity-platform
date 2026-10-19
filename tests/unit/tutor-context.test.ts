import test from "node:test";
import assert from "node:assert/strict";
import { getCourseModule } from "../../src/modules/academics/curriculum";

test("all CS101 modules provide tutor-grounding without needing answer keys", () => {
  for (const id of ["computational-thinking", "programming-fundamentals", "conditions-loops", "personal-study-planner-capstone"]) {
    const lesson = getCourseModule(id);
    assert.ok(lesson, `Missing lesson ${id}`);
    assert.ok(lesson.outcome.length > 15);
    assert.ok(lesson.sections.length);
    assert.ok(lesson.sections.every((section) => section.heading && section.body));
  }
  assert.equal(getCourseModule("not-a-module"), undefined);
});
