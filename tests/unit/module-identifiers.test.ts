import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assessmentModuleId, assessmentModuleIds } from "../../src/modules/assessments/module-identifiers";
import { courseModules } from "../../src/modules/academics/curriculum";

test("every follow-on CS101 module maps to the real published database module ID", async () => {
  const seeded = await readFile("supabase/migrations/20261019090000_virtual_university.sql", "utf8");
  const mapped = Object.entries(assessmentModuleIds);
  assert.equal(mapped.length, 9);
  assert.equal(courseModules.length, 10);
  for (const [index, lesson] of courseModules.entries()) {
    if (index === 0) {
      assert.equal(assessmentModuleId(lesson.id), null);
      continue;
    }
    const id = assessmentModuleId(lesson.id);
    assert.equal(id, `cs101-${String(index + 1).padStart(2,"0")}`);
    assert.ok(id);
    assert.ok(seeded.includes(id), `Missing seeded database module ${id}`);
  }
  assert.equal(assessmentModuleId("__proto__"), null);
  assert.equal(assessmentModuleId("bogus"), null);
});
