import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("SQL migration enforces ownership, enrollment, database grading and immutable best scores", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
 insert into auth.users values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`);
    const schema = await readFile("supabase/foundation.sql", "utf8");
    const baseline = await readFile(
      "supabase/migrations/20261018131843_foundation.sql",
      "utf8",
    );
    const expansion = await readFile(
      "supabase/migrations/20261019090000_virtual_university.sql",
      "utf8",
    );
    assert.equal(schema, baseline + expansion);
    await db.exec(baseline);
    await db.exec(expansion);
    await db.exec(
      `set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';`,
    );
    await assert.rejects(
      () => db.query(`select public.submit_foundation_check('[1,2,0,2,1]')`),
      /Enrollment required/,
    );
    await assert.rejects(
      () =>
        db.exec(
          `insert into public.enrollments(user_id,course_id) values('00000000-0000-0000-0000-000000000002','cs101')`,
        ),
      /row-level security/,
    );
    await db.exec(
      `insert into public.enrollments(user_id,course_id) values('00000000-0000-0000-0000-000000000001','cs101')`,
    );
    await assert.rejects(
      () => db.query(`select public.submit_foundation_check('[1,2,0,2]')`),
      /five questions/,
    );
    await assert.rejects(
      () => db.query(`select public.submit_foundation_check('[1,2,0,2,"1"]')`),
      /Invalid answer/,
    );
    const result = await db.query<{ score: number }>(
      `select public.submit_foundation_check('[1,2,0,2,1]') as score`,
    );
    assert.equal(result.rows[0].score, 100);
    await db.query(`select public.submit_foundation_check('[0,0,0,0,0]')`);
    const best = await db.query<{ score: number; completed: boolean }>(
      `select score,completed from public.lesson_progress`,
    );
    assert.deepEqual(best.rows, [{ score: 100, completed: true }]);
    await assert.rejects(
      () => db.query(`select public.submit_course_check('cs101-02','[0,1,0]')`),
      /Answer every question/,
    );
    await assert.rejects(
      () => db.query(`select public.submit_course_check('cs101-02','[0,1,0,1,9]')`),
      /Invalid answer/,
    );
    const moduleResult = await db.query<{ score: number }>(
      `select public.submit_course_check('cs101-02','[0,1,0,1,0]') as score`,
    );
    assert.equal(moduleResult.rows[0].score, 100);
    assert.equal((await db.query(`select * from public.assessment_attempts`)).rows.length, 1);
    await assert.rejects(
      () => db.query(`select * from private.course_assessment_keys`),
      /permission denied/,
    );
    await assert.rejects(
      () => db.exec(`update public.lesson_progress set score=0`),
      /permission denied/,
    );
    await assert.rejects(
      () =>
        db.exec(
          `insert into public.lesson_progress(user_id,lesson_id,content_version,score) values('00000000-0000-0000-0000-000000000002','computational-thinking','0.1.0',100)`,
        ),
      /permission denied/,
    );
    await db.exec(
      `set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002'`,
    );
    assert.equal(
      (await db.query(`select * from public.enrollments`)).rows.length,
      0,
    );
    assert.equal(
      (await db.query(`select * from public.lesson_progress`)).rows.length,
      0,
    );
    assert.equal(
      (await db.query(`select * from public.assessment_attempts`)).rows.length,
      0,
    );
    await assert.rejects(
      () => db.query(`select public.submit_foundation_check('[1,2,0,2,1]')`),
      /Enrollment required/,
    );
    await db.exec(
      `reset role; insert into public.courses values('draft','cs-foundations','Draft',false); set role anon;`,
    );
    assert.equal(
      (await db.query(`select * from public.courses where id='draft'`)).rows
        .length,
      0,
    );
    await assert.rejects(
      () => db.query(`select * from public.enrollments`),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query(`select public.submit_foundation_check('[1,2,0,2,1]')`),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
