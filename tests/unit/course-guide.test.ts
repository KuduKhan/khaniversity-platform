import test from "node:test";
import assert from "node:assert/strict";
import { courseOutline } from "../../src/modules/academics/course-outline";
import { courseModules } from "../../src/modules/academics/curriculum";
import { buildLearningPlan } from "../../src/modules/academics/learning-plan";
import { courseStages, estimatedCourseMinutes, getModuleGuide, moduleGuide } from "../../src/modules/academics/course-guide";

test("the learner-facing course outline contains no graded assessment answers", () => {
  assert.equal(courseOutline.length, 10);
  for (const [index, row] of courseOutline.entries()) {
    assert.deepEqual(
      [courseModules[index].id, courseModules[index].title, courseModules[index].description, courseModules[index].outcome],
      [row.id, row.title, row.description, row.outcome],
    );
    assert.equal(Object.hasOwn(row, "checks"), false);
    assert.equal(Object.hasOwn(row, "answer"), false);
    assert.ok(row.outcome.length > 30);
  }
});

test("course stages cover each lesson exactly once, in official syllabus order", () => {
  assert.equal(courseStages.length, 4);
  const ids = courseStages.flatMap((stage) => stage.modules.map((module) => module.id));
  assert.deepEqual(ids, courseOutline.map((module) => module.id));
  assert.equal(new Set(ids).size, courseOutline.length);
  for (const [index, item] of courseOutline.entries()) {
    const guide = getModuleGuide(item.id);
    assert.ok(guide);
    assert.equal(guide.index, index);
    assert.equal(guide.prerequisite?.id ?? null, index ? courseOutline[index - 1].id : null);
    assert.ok(moduleGuide[item.id].practiceFocus.length > 30);
    assert.ok(moduleGuide[item.id].capstoneConnection.length > 30);
    assert.ok(moduleGuide[item.id].studyMinutes >= 15);
  }
  assert.ok(estimatedCourseMinutes > 0);
  assert.equal(getModuleGuide("invalid-lesson"), null);
});

test("public syllabus navigation preserves the authoritative mastery sequence", () => {
  const plan = buildLearningPlan({
    completed: true,
    score: 100,
    moduleProgress: {
      "programming-fundamentals": { score: 60, completedAt: "2026-11-05T00:00:00Z" },
    },
  });
  assert.equal(plan.next.id, courseOutline[1].id);
  assert.equal(plan.mastered, 1);
  assert.equal(plan.review.length, 1);
});
