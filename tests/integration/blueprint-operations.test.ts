import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const student = "00000000-0000-0000-0000-000000000001";
const reviewer = "00000000-0000-0000-0000-000000000002";
const instructor = "00000000-0000-0000-0000-000000000003";

test("operational blueprint migration separates account code from reviewed evidence and staff content", async () => {
  const db = new PGlite();
  const setActor = async (id: string) =>
    db.exec(`set request.jwt.claim.sub='${id}';`);
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable
        as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
      insert into auth.users values('${student}'),('${reviewer}'),('${instructor}');`);
    for (const file of [
      "supabase/migrations/20261018131843_foundation.sql",
      "supabase/migrations/20261019090000_virtual_university.sql",
      "supabase/migrations/20261019191000_operational_blueprint.sql",
    ]) await db.exec(await readFile(file,"utf8"));
    await db.exec(`insert into public.course_staff(user_id,course_id,role) values
      ('${instructor}','cs101','instructor'),
      ('${reviewer}','cs101','reviewer');`);

    await db.exec("set role authenticated");
    await setActor(student);
    await assert.rejects(
      () => db.exec(`insert into public.code_submissions(user_id,course_id,exercise_id,source_code)
        values('${student}','cs101','total-minutes','def total_minutes(x): return sum(x)')`),
      /row-level security/,
    );
    await db.exec(`insert into public.enrollments(user_id,course_id) values('${student}','cs101')`);
    await assert.rejects(
      () => db.exec(`insert into public.code_submissions(user_id,course_id,exercise_id,source_code)
        values('${reviewer}','cs101','total-minutes','def total_minutes(x): return sum(x)')`),
      /row-level security/,
    );
    await db.exec(`insert into public.code_submissions(user_id,course_id,exercise_id,source_code)
        values('${student}','cs101','total-minutes','def total_minutes(x): return sum(x)')`);
    const results=await db.query<{id:string;status:string;code_tests_passed:boolean}>(
      "select id,status,code_tests_passed from public.code_submissions");
    assert.equal(results.rows.length,1);
    assert.equal(results.rows[0].status,"submitted");
    assert.equal(results.rows[0].code_tests_passed,false);
    await assert.rejects(
      () => db.exec("update public.code_submissions set code_tests_passed=true"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query(`select public.review_code_submission('${results.rows[0].id}',true,'')`),
      /Course review permission required/,
    );

    await setActor(instructor);
    await db.exec(`insert into public.lesson_revisions
      (course_id,lesson_id,base_content_version,title,body,author_id)
      values ('cs101','programming-fundamentals','1.0.0','Understanding Python loops',
        'Explain what the loop does by tracing the current index and total. Show a tiny sample, then check that an empty list yields zero before introducing a new edge case.',
        '${instructor}')`);
    const revisions=await db.query<{id:number;status:string}>(
      "select id,status from public.lesson_revisions");
    assert.equal(revisions.rows.length,1);
    await assert.rejects(
      () => db.query(`select public.review_lesson_revision(${revisions.rows[0].id},true,'')`),
      /Review permission required/,
    );
    await assert.rejects(
      () => db.exec("update public.lesson_revisions set status='published'"),
      /permission denied/,
    );

    await setActor(reviewer);
    assert.equal((await db.query("select id from public.code_submissions")).rows.length,1);
    await db.query(`select public.review_code_submission('${results.rows[0].id}',true,'Verified output and boundary tests')`);
    await db.query(`select public.review_lesson_revision(${revisions.rows[0].id},true,'Independent instructional approval')`);
    assert.equal(
      (await db.query<{status:string}>("select status from public.lesson_revisions")).rows[0].status,
      "published",
    );
    await assert.rejects(
      () => db.query(`select public.review_lesson_revision(${revisions.rows[0].id},false,'')`),
      /already reviewed/,
    );
    const audits=await db.query<{action:string}>(
      "select action from public.audit_logs where action in ('lesson.material_published','codelab.reviewed') order by action");
    assert.deepEqual(audits.rows.map(x=>x.action),["codelab.reviewed","lesson.material_published"]);

    await setActor(student);
    const reviewed=await db.query<{status:string;code_tests_passed:boolean}>(
      "select status,code_tests_passed from public.code_submissions");
    assert.deepEqual(reviewed.rows,[{status:"reviewed",code_tests_passed:true}]);
    assert.equal((await db.query("select id from public.lesson_revisions")).rows.length,1);
    await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000004'");
    assert.equal((await db.query("select id from public.code_submissions")).rows.length,0);
    await db.exec("set role anon");
    await assert.rejects(
      () => db.query("select * from public.code_submissions"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
