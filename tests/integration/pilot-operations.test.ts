import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const alice = "00000000-0000-0000-0000-000000000061";
const admin = "00000000-0000-0000-0000-000000000062";
const reviewer = "00000000-0000-0000-0000-000000000063";
const code = "KH-CS101-PILOT-TEST-UNGUESSABLE-00000000000001";

test("0.3 staff access revocation is admin-only, audited, and blocks self-escalation", async () => {
  const db = new PGlite();
  const actor = (id: string) => db.exec(`set request.jwt.claim.sub='${id}'`);
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable
        as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
      insert into auth.users values
      ('${alice}','learner@example.invalid',now()),
      ('${admin}','administrator@example.invalid',now()),
      ('${reviewer}','reviewer@example.invalid',now());`);
    for (const migration of [
      "supabase/migrations/20261018131843_foundation.sql",
      "supabase/migrations/20261019090000_virtual_university.sql",
      "supabase/migrations/20261019192741_operational_blueprint.sql",
      "supabase/migrations/20261019200411_capstone_submission_review.sql",
      "supabase/migrations/20261020120000_pilot_operations.sql",
    ]) await db.exec(await readFile(migration,"utf8"));
    await db.exec(`insert into public.course_staff(user_id,course_id,role) values
      ('${admin}','cs101','administrator'),
      ('${reviewer}','cs101','reviewer');
      insert into public.credentials(credential_code,user_id,course_id,recipient_name,title,issued_by,evidence_summary)
      values ('${code}','${alice}','cs101','Learner Example','CS101',
        '${admin}','Ten completed course modules and independently reviewed work');`);
    await db.exec("set role authenticated");
    await actor(reviewer);
    await assert.rejects(
      () => db.query(`select public.revoke_cs101_staff('${admin}','administrator')`),
      /Administrator authorization required/,
    );
    await actor(admin);
    await assert.rejects(
      () => db.query(`select public.revoke_cs101_staff('${admin}','administrator')`),
      /Self-revocation is forbidden/,
    );
    await db.query(`select public.revoke_cs101_staff('${reviewer}','reviewer')`);
    await assert.rejects(
      () => db.query(`select public.revoke_cs101_staff('${reviewer}','reviewer')`),
      /Staff assignment not found/,
    );
    const audits=await db.query<{action:string;target_user_id:string}>(
      "select action,target_user_id from public.audit_logs where action='staff.role_revoked'");
    assert.deepEqual(audits.rows,[{action:"staff.role_revoked",target_user_id:reviewer}]);
    await actor(reviewer);
    await assert.rejects(
      () => db.query(`select public.revoke_cs101_staff('${admin}','administrator')`),
      /Administrator authorization required/,
    );
    await db.exec("set role anon");
    await assert.rejects(
      () => db.query("select * from public.credentials"),
      /permission denied/,
    );
    const publicAward=await db.query<{status:string;recipient_name:string}>(`
      select status,recipient_name from public.verify_course_credential('${code}')`);
    assert.deepEqual(publicAward.rows,[{status:"valid",recipient_name:"Learner Example"}]);
    await assert.rejects(
      () => db.query("select * from private.issue_cs101_credential(null)"),
      /permission denied/,
    );
    assert.equal((await db.query(
      "select * from public.verify_course_credential('KH-CS101-NOT-ISSUED')"
    )).rows.length,0);
  } finally {
    await db.close();
  }
});
