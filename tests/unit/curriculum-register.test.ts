import test from "node:test";
import assert from "node:assert/strict";
import { buildCurriculumRegister } from "../../src/modules/platforms/curriculum-register";

test("academic operations publication register separates published and missing lessons", () => {
  const register = buildCurriculumRegister(
    [{ id:"cs101-01",title:"Computational thinking" },{ id:"cs101-02",title:"Python" }],
    [{ id:"computational-thinking",title:"Computational thinking",module_id:"cs101-01",content_version:"0.1.0",published:true }],
  );
  assert.equal(register.entries.length,2);
  assert.equal(register.publishedCount,1);
  assert.equal(register.draftCount,1);
  assert.equal(register.entries[1].hasLesson,false);
});
