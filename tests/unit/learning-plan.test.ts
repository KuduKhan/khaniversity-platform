import test from "node:test";
import assert from "node:assert/strict";
import { buildLearningPlan } from "../../src/modules/academics/learning-plan";

test("an unstarted learner is directed to the first lesson", () => {
  const plan = buildLearningPlan({ completed: false, score: null });
  assert.equal(plan.mastered, 0);
  assert.equal(plan.percentage, 0);
  assert.equal(plan.next.id, "computational-thinking");
  assert.deepEqual(plan.review, []);
});

test("a failed check appears in revision queue, not as mastered", () => {
  const plan = buildLearningPlan({ completed: false, score: 60 });
  assert.equal(plan.mastered, 0);
  assert.equal(plan.next.id, "computational-thinking");
  assert.equal(plan.review.length, 1);
});

test("a passed first lesson takes the learner to Python", () => {
  const plan = buildLearningPlan({ completed: true, score: 100 });
  assert.equal(plan.mastered, 1);
  assert.equal(plan.next.id, "programming-fundamentals");
  assert.equal(plan.percentage, 10);
});

test("mastering all checks never implies a verified credential", () => {
  const ids = ["programming-fundamentals","variables-data-input-output","conditions-loops","functions-scope","collections","files-exceptions-debugging","algorithms-complexity","testing-git-quality","personal-study-planner-capstone"];
  const moduleProgress = Object.fromEntries(ids.map((id) => [id, { score: 100, completedAt: "2026-10-19T00:00:00Z" }]));
  const plan = buildLearningPlan({ completed: true, score: 100, moduleProgress });
  assert.equal(plan.mastered, 10);
  assert.equal(plan.hasFinishedChecks, true);
  assert.equal(plan.next.id, "personal-study-planner-capstone");
});

test("dashboard and syllabus derive the same canonical module mastery and retry decision", () => {
  const plan = buildLearningPlan({
    completed: true,
    score: 100,
    moduleProgress: {
      "programming-fundamentals": { score: 60, completedAt: "2026-11-06T00:00:00Z" },
    },
  });
  assert.equal(plan.checkpoints[0].status, "mastered");
  assert.equal(plan.checkpoints[1].status, "needs-review");
  assert.equal(plan.checkpoints[2].status, "not-started");
  assert.equal(plan.next.id, "programming-fundamentals");
  assert.equal(plan.nextAction.kind, "retry");
  assert.equal(plan.nextAction.href, plan.nextHref);
  assert.equal(plan.nextAction.heading, "Build confidence with a focused retry");
});

test("malformed or out-of-range local values cannot produce false mastery", () => {
  const plan = buildLearningPlan({
    completed: true,
    score: Number.NaN,
    moduleProgress: {
      "programming-fundamentals": { score: 150, completedAt: "" },
      "variables-data-input-output": { score: 80, completedAt: "" },
    },
  });
  assert.equal(plan.checkpoints[0].score, null);
  assert.equal(plan.checkpoints[1].status, "not-started");
  assert.equal(plan.checkpoints[2].status, "mastered");
  assert.equal(plan.mastered, 1);
  assert.equal(plan.next.id, "computational-thinking");
  assert.equal(plan.hasFinishedChecks, false);
});
