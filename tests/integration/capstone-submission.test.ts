import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const alice="00000000-0000-0000-0000-000000000031";
const bob="00000000-0000-0000-0000-000000000032";
const tutor="00000000-0000-0000-0000-000000000033";
const reviewer="00000000-0000-0000-0000-000000000034";

test("capstone snapshots are immutable, private, reviewer-graded and audited",async()=>{
  const db=new PGlite();
  const actor=async(id:string)=>db.exec(`set request.jwt.claim.sub='${id}'`);
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable
        as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
      insert into auth.users values
      ('${alice}','student-a@example.invalid',now()),
      ('${bob}','student-b@example.invalid',now()),
      ('${tutor}','instructor@example.invalid',now()),
      ('${reviewer}','reviewer@example.invalid',now());`);
    for(const file of [
      "supabase/migrations/20261018131843_foundation.sql",
      "supabase/migrations/20261019090000_virtual_university.sql",
      "supabase/migrations/20261019192741_operational_blueprint.sql",
      "supabase/migrations/20261019224500_capstone_submission_review.sql",
    ]) await db.exec(await readFile(file,"utf8"));
    await db.exec(`insert into public.course_staff(user_id,course_id,role) values
      ('${tutor}','cs101','instructor'),('${reviewer}','cs101','reviewer');`);
    await db.exec("set role authenticated");await actor(alice);
    await assert.rejects(()=>db.query("select public.submit_cs101_capstone()"),/Enroll in CS101/);
    await db.exec(`insert into public.enrollments(user_id,course_id) values('${alice}','cs101')`);
    await assert.rejects(()=>db.query("select public.submit_cs101_capstone()"),/Save your project draft/);
    const savedPath=await db.query<{submit_learning_diagnostic:{score:number;byTopic:Record<string,number>}}>(
      "select public.submit_learning_diagnostic('[0,1,1,0,1,0]'::jsonb)");
    assert.equal(savedPath.rows[0].submit_learning_diagnostic.score,100);
    assert.equal(savedPath.rows[0].submit_learning_diagnostic.byTopic["Python foundations"],100);
    await assert.rejects(()=>db.exec(`insert into public.learning_diagnostics(user_id,course_id,score,topic_scores)
      values('${alice}','cs101',100,'{}')`),/permission denied/);
    await assert.rejects(()=>db.query("select public.submit_learning_diagnostic('[0,1]'::jsonb)"),/Six diagnostic answers/);

    await db.exec(`insert into public.project_drafts
      (user_id,course_id,title,source_code,reflection) values
      ('${alice}','cs101','My Personal Study Planner',
      'def study_plan(tasks):\\n    return sorted(tasks, key=lambda x: x.get("priority", 0)) # study tasks',
      'I chose a list of dictionaries to represent tasks, enabling priority ordering and meaningful tests for empty and invalid task input.')`);
    const result=await db.query<{submit_cs101_capstone:string}>("select public.submit_cs101_capstone()");
    const id=result.rows[0].submit_cs101_capstone;
    assert.match(id,/^[0-9a-f-]{36}$/);
    await assert.rejects(()=>db.query("select public.submit_cs101_capstone()"),/awaiting review/);
    await assert.rejects(()=>db.exec("delete from public.capstone_submissions"),/permission denied/);
    await assert.rejects(()=>db.exec("update public.capstone_submissions set status='reviewed'"),/permission denied/);
    await assert.rejects(()=>db.exec(`insert into public.capstone_reviews
      (user_id,course_id,reviewer_id,score,code_tests_passed,rubric,feedback)
      values('${alice}','cs101','${alice}',100,true,'{}','Student forged feedback is not permitted')`),/permission denied/);
    // Editing the draft does not rewrite the independently submitted evidence.
    await db.exec(`update public.project_drafts set source_code='maliciously edited post-review draft'
      where user_id='${alice}' and course_id='cs101'`);
    const snapshot=await db.query<{source_code:string}>("select source_code from public.capstone_submissions");
    assert.ok(snapshot.rows[0].source_code.includes("def study_plan"));

    await actor(bob);
    assert.equal((await db.query("select id from public.capstone_submissions")).rows.length,0);
    assert.equal((await db.query("select score from public.learning_diagnostics")).rows.length,0);
    await assert.rejects(()=>db.query("select public.submit_learning_diagnostic('[0,1,1,0,1,0]'::jsonb)"),/Enroll in CS101/);

    await assert.rejects(()=>db.query(`select public.review_cs101_capstone('${id}','{}',true,'Try to tamper with another student')`),/Assigned academic staff only/);
    await actor(tutor);
    await assert.rejects(()=>db.query(`select public.review_cs101_capstone('${id}','{}',true,'Valid feedback but no scoring')`),/Six rubric criteria/);
    const rubric=JSON.stringify({features:90,inputHandling:80,dataModel:85,tests:90,readability:85,explanation:95}).replace(/'/g,"''");
    await actor(reviewer);
    const scored=await db.query<{review_cs101_capstone:number}>(`select public.review_cs101_capstone('${id}','${rubric}'::jsonb,true,'Verified the frozen source and the required Python test cases')`);
    assert.ok(scored.rows[0].review_cs101_capstone>=80);
    await assert.rejects(()=>db.query(`select public.review_cs101_capstone('${id}','${rubric}'::jsonb,true,'Trying to double review already accepted work')`),/already reviewed/);
    const grade=await db.query<{submission_id:string;score:number}>("select submission_id,score from public.capstone_reviews");
    assert.equal(grade.rows[0].submission_id,id);
    await assert.rejects(()=>db.query(`select public.issue_cs101_credential('${alice}')`),/reviewed CodeLab submission/);
    const audit=await db.query<{action:string}>("select action from public.audit_logs where action like 'capstone.%' order by action");
    assert.deepEqual(audit.rows.map(x=>x.action),["capstone.reviewed","capstone.submitted"]);
    await actor(alice);
    assert.equal((await db.query("select id from public.capstone_submissions")).rows.length,1);
    assert.equal((await db.query("select id from public.capstone_submissions where status='reviewed'")).rows.length,1);
    await actor(bob);
    assert.equal((await db.query("select id from public.capstone_submissions")).rows.length,0);
  } finally {await db.close();}
});
