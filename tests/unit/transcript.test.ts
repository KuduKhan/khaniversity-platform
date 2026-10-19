import test from "node:test";
import assert from "node:assert/strict";
import { summarizeTranscript, type TranscriptData } from "../../src/modules/academics/transcript";

const empty: TranscriptData = { progress:[], attempts:[], code:[], capstones:[], reviews:[], awards:[], diagnostics:[] };

test("an empty authenticated record has no implied completions or awards", () => {
  assert.deepEqual(
    { ...summarizeTranscript(empty), reviewedCapstones: [...summarizeTranscript(empty).reviewedCapstones] },
    { assessedModules:0,masteredModules:0,attempts:0,reviewedCode:0,pendingReviews:0,activeAwards:0,reviewedCapstones:[] },
  );
});

test("mastery counts latest lesson progress, including the foundation lesson without an assessment_attempt", () => {
  const result=summarizeTranscript({ ...empty, progress:[
    {lesson_id:"computational-thinking",content_version:"0.1.0",score:100,completed:true,updated_at:"2026-10-20"},
    {lesson_id:"computational-thinking",content_version:"0.0.1",score:30,completed:false,updated_at:"2026-10-19"},
    {lesson_id:"programming-fundamentals",content_version:"1.0.0",score:60,completed:false,updated_at:"2026-10-20"},
    {lesson_id:"unknown",content_version:"1.0.0",score:100,completed:true,updated_at:"2026-10-20"},
  ], attempts:[
    {id:1,module_id:"cs101-02",score:60,submitted_at:"2026-10-20"},
    {id:2,module_id:"cs101-02",score:40,submitted_at:"2026-10-19"},
  ]});
  assert.equal(result.masteredModules,1);
  assert.equal(result.assessedModules,2);
  assert.equal(result.attempts,2);
});

test("pending submissions and revoked awards are not presented as reviewed or active", () => {
  const result=summarizeTranscript({ ...empty,
    code:[
      {id:"a",exercise_id:"total-minutes",status:"submitted",code_tests_passed:false,feedback:"",submitted_at:"2026-10-19",reviewed_at:null},
      {id:"b",exercise_id:"total-minutes",status:"reviewed",code_tests_passed:true,feedback:"Done",submitted_at:"2026-10-19",reviewed_at:"2026-10-20"},
    ],
    capstones:[{id:"c",title:"Study planner",status:"submitted",submitted_at:"2026-10-19",reviewed_at:null}],
    awards:[
      {credential_code:"one",title:"CS101",issued_at:"2026-10-19",revoked_at:null},
      {credential_code:"two",title:"CS101",issued_at:"2026-10-19",revoked_at:"2026-10-20"},
    ],
    reviews:[{submission_id:"old",score:83,code_tests_passed:true,feedback:"Accepted",reviewed_at:"2026-10-20"}]
  });
  assert.equal(result.pendingReviews,2);
  assert.equal(result.reviewedCode,1);
  assert.equal(result.activeAwards,1);
  assert.equal(result.reviewedCapstones.get("old")?.score,83);
});
