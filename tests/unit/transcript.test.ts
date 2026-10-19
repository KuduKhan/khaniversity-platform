import test from "node:test";
import assert from "node:assert/strict";
import { summarizeTranscript, type TranscriptData } from "../../src/modules/academics/transcript";

const empty: TranscriptData = { attempts:[], code:[], capstones:[], reviews:[], awards:[], diagnostics:[] };

test("an empty authenticated record has no implied completions or awards", () => {
  assert.deepEqual(
    { ...summarizeTranscript(empty), reviewedCapstones: [...summarizeTranscript(empty).reviewedCapstones] },
    { assessedModules:0,masteredModules:0,attempts:0,reviewedCode:0,pendingReviews:0,activeAwards:0,reviewedCapstones:[] },
  );
});

test("transcript only counts a passing best score once for each module", () => {
  const result=summarizeTranscript({ ...empty, attempts:[
    {id:1,module_id:"cs101-01",score:40,submitted_at:"2026-10-19"},
    {id:2,module_id:"cs101-01",score:80,submitted_at:"2026-10-20"},
    {id:3,module_id:"cs101-02",score:60,submitted_at:"2026-10-20"},
  ]});
  assert.equal(result.masteredModules,1);
  assert.equal(result.assessedModules,2);
  assert.equal(result.attempts,3);
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
