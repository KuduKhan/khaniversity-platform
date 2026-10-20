import test from "node:test";
import assert from "node:assert/strict";
import {
  pilotQueueCount, pilotRate, summarizePilot, type PilotInput,
} from "../../src/modules/operations/pilot-metrics";

const empty = (): PilotInput => ({
  enrollments: [], progress: [],
  modules: Array.from({ length: 10 }, (_, i) => ({
    id: `cs101-${String(i + 1).padStart(2, "0")}`,
    title: `Module ${i + 1}`, position: i + 1,
  })),
  lessons: [], code: [], capstones: [], reviews: [], revisions: [],
});
const now = new Date("2026-10-20T12:00:00.000Z");

test("zero-enrollment pilot has no artificial activation or completion rate", () => {
  assert.equal(pilotRate(0,0),null);
  assert.equal(pilotRate(7,10),70);
  const summary = summarizePilot(empty(), now);
  assert.equal(summary.enrolled,0);
  assert.equal(summary.startedFirstLesson,0);
  assert.equal(summary.completionEligible,0);
  assert.equal(summary.moduleMastery.length,10);
  assert.equal(pilotQueueCount(summary),0);
});

test("CS101 cohort analytics enforce enrollment, current lesson version and privacy boundaries", () => {
  const input=empty();
  input.enrollments.push(
    {user_id:"alice",enrolled_at:"2026-10-19T12:00:00.000Z"},
    {user_id:"bob",enrolled_at:"2026-10-01T12:00:00.000Z"},
  );
  input.lessons.push({id:"computational-thinking",module_id:"cs101-01",content_version:"2.0",published:true});
  input.progress.push(
    {user_id:"alice",lesson_id:"computational-thinking",content_version:"2.0",completed:true},
    {user_id:"bob",lesson_id:"computational-thinking",content_version:"1.0",completed:true},
    {user_id:"outsider",lesson_id:"computational-thinking",content_version:"2.0",completed:true},
  );
  input.code.push({user_id:"alice",status:"submitted",code_tests_passed:false,submitted_at:"2026-10-16T12:00:00.000Z"});
  input.capstones.push({id:"capA",user_id:"alice",status:"submitted",submitted_at:"2026-10-19T12:00:00.000Z"});
  input.revisions.push({status:"pending"});
  const summary=summarizePilot(input,now);
  assert.equal(summary.enrolled,2);
  assert.equal(summary.enrolledLast7Days,1);
  assert.equal(summary.startedFirstLesson,1);
  assert.equal(summary.masteredFirstLesson,1);
  assert.equal(summary.moduleMastery[0].mastered,1);
  assert.equal(summary.completionEligible,0);
  assert.equal(summary.overdueReviews,1);
  assert.equal(pilotQueueCount(summary),3);
  assert.equal(JSON.stringify(summary).includes("alice"),false,"aggregates must exclude user identifiers");
});

test("award eligibility requires ten modules plus separately approved code and capstone", () => {
  const input=empty();
  input.enrollments.push({user_id:"alice",enrolled_at:"2026-10-19T12:00:00.000Z"});
  input.lessons.push(...input.modules.map((m,i)=>({
    id:`lesson-${i}`,module_id:m.id,content_version:"1.0.0",published:true,
  })));
  input.progress.push(...input.lessons.map(l=>({
    user_id:"alice",lesson_id:l.id,content_version:l.content_version,completed:true,
  })));
  input.code.push({user_id:"alice",status:"reviewed",code_tests_passed:true,submitted_at:"2026-10-19T12:00:00.000Z"});
  input.capstones.push({id:"cap1",user_id:"alice",status:"reviewed",submitted_at:"2026-10-19T12:00:00.000Z"});
  input.reviews.push({user_id:"alice",submission_id:"cap1",score:80,code_tests_passed:true});
  assert.equal(summarizePilot(input,now).completionEligible,1);
  input.reviews[0].code_tests_passed=false;
  assert.equal(summarizePilot(input,now).completionEligible,0);
  input.reviews[0].code_tests_passed=true;
  input.progress.pop();
  assert.equal(summarizePilot(input,now).completionEligible,0);
});

test("pending faculty work and overdue thresholds remain independent of student completion", () => {
  const input=empty();
  input.code.push({user_id:"alice",status:"submitted",code_tests_passed:false,submitted_at:"2026-10-16T12:00:00.000Z"});
  input.capstones.push({id:"c",user_id:"alice",status:"submitted",submitted_at:"2026-10-16T12:00:00.000Z"});
  input.revisions.push({status:"pending"});
  const summary=summarizePilot(input,now);
  assert.equal(summary.overdueReviews,2);
  assert.equal(pilotQueueCount(summary),3);
  assert.equal(summary.completionEligible,0);
});
