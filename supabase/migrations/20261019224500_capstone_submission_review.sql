-- CS101 capstone integrity: a draft is NOT an academic submission.
-- Student-facing submission is an immutable snapshot, independently reviewed.
create table public.capstone_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  title text not null check (length(btrim(title)) between 5 and 100),
  source_code text not null check (length(btrim(source_code)) between 50 and 20000),
  reflection text not null check (length(btrim(reflection)) between 80 and 3000),
  status text not null default 'submitted'
    check (status in ('submitted','reviewed','needs-work')),
  submitted_at timestamptz not null default now(),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  constraint capstone_decision_consistent check (
    (status='submitted' and reviewer_id is null and reviewed_at is null)
    or (status in ('reviewed','needs-work') and reviewer_id is not null and reviewed_at is not null)
  )
);
create unique index capstone_one_pending_per_course
  on public.capstone_submissions(user_id,course_id) where status='submitted';
create index capstone_student_history
  on public.capstone_submissions(user_id,course_id,submitted_at desc);
create index capstone_staff_queue
  on public.capstone_submissions(course_id,status,submitted_at desc);
alter table public.capstone_submissions enable row level security;
revoke all on public.capstone_submissions from public,anon,authenticated;
grant select on public.capstone_submissions to authenticated;
create policy capstone_student_own_read on public.capstone_submissions for select
  to authenticated using (user_id=(select auth.uid()));
create policy capstone_assigned_staff_read on public.capstone_submissions for select
  to authenticated using (
    private.has_course_role(course_id,array['instructor','reviewer','administrator'])
  );

alter table public.capstone_reviews
  add column submission_id uuid references public.capstone_submissions(id);
-- Student grades must be written through a validated audited RPC, not direct updates.
revoke insert,update on public.capstone_reviews from authenticated;

create function private.submit_cs101_capstone()
returns uuid language plpgsql security definer set search_path='' as $$
declare
  learner uuid := auth.uid();
  draft public.project_drafts%rowtype;
  submission uuid;
begin
  if learner is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.enrollments
      where user_id=learner and course_id='cs101') then
    raise exception 'Enroll in CS101 before submitting' using errcode='42501';
  end if;
  select * into draft from public.project_drafts
    where user_id=learner and course_id='cs101' for update;
  if not found then raise exception 'Save your project draft first'; end if;
  if length(btrim(draft.title))<5 or length(btrim(draft.source_code))<50
      or length(btrim(draft.reflection))<80 then
    raise exception 'Provide a project name, at least 50 characters of Python and an 80-character design reflection';
  end if;
  if exists(select 1 from public.capstone_submissions
      where user_id=learner and course_id='cs101' and status='submitted') then
    raise exception 'A capstone is awaiting review';
  end if;
  if (select count(*) from public.capstone_submissions
       where user_id=learner and course_id='cs101'
         and submitted_at>=now()-interval '1 day') >= 3 then
    raise exception 'Daily submission limit reached';
  end if;
  insert into public.capstone_submissions(user_id,course_id,title,source_code,reflection)
    values(learner,'cs101',draft.title,draft.source_code,draft.reflection)
    returning id into submission;
  insert into public.audit_logs(actor_id,target_user_id,course_id,action,details)
    values(learner,learner,'cs101','capstone.submitted',
      jsonb_build_object('submission_id',submission));
  return submission;
end;
$$;
revoke all on function private.submit_cs101_capstone() from public,anon;
grant execute on function private.submit_cs101_capstone() to authenticated;
create function public.submit_cs101_capstone()
returns uuid language sql security invoker set search_path='' as $$
  select private.submit_cs101_capstone();
$$;
revoke all on function public.submit_cs101_capstone() from public,anon;
grant execute on function public.submit_cs101_capstone() to authenticated;

create function private.review_cs101_capstone(
  p_submission_id uuid,p_rubric jsonb,p_code_tests_passed boolean,p_feedback text
) returns integer language plpgsql security definer set search_path='' as $$
declare
  row_data public.capstone_submissions%rowtype;
  required_key text;
  points integer;
  total integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into row_data from public.capstone_submissions
    where id=p_submission_id for update;
  if not found then raise exception 'Capstone submission not found'; end if;
  if not private.has_course_role(row_data.course_id,array['instructor','reviewer','administrator']) then
    raise exception 'Assigned academic staff only' using errcode='42501';
  end if;
  if row_data.user_id=auth.uid() then raise exception 'Self-review is prohibited' using errcode='42501'; end if;
  if row_data.status<>'submitted' then raise exception 'This capstone was already reviewed'; end if;
  if p_code_tests_passed is null or length(btrim(coalesce(p_feedback,''))) not between 20 and 3000 then
    raise exception 'Provide a test decision and specific written feedback';
  end if;
  if jsonb_typeof(p_rubric) is distinct from 'object'
     or (select count(*) from jsonb_object_keys(p_rubric))<>6 then
    raise exception 'Six rubric criteria are required';
  end if;
  foreach required_key in array array[
    'features','inputHandling','dataModel','tests','readability','explanation'
  ] loop
    if jsonb_typeof(p_rubric->required_key) is distinct from 'number'
       or (p_rubric->>required_key) !~ '^[0-9]{1,3}$' then
      raise exception 'Each rubric mark must be an integer';
    end if;
    points := (p_rubric->>required_key)::integer;
    if points>100 then raise exception 'Rubric marks must be 0 to 100'; end if;
  end loop;
  total:=round((p_rubric->>'features')::numeric*.25
        +(p_rubric->>'inputHandling')::numeric*.15
        +(p_rubric->>'dataModel')::numeric*.15
        +(p_rubric->>'tests')::numeric*.20
        +(p_rubric->>'readability')::numeric*.15
        +(p_rubric->>'explanation')::numeric*.10);
  update public.capstone_submissions
     set status=case when total>=80 and p_code_tests_passed then 'reviewed' else 'needs-work' end,
         reviewer_id=auth.uid(),reviewed_at=now()
   where id=p_submission_id;
  insert into public.capstone_reviews
    (user_id,course_id,reviewer_id,score,code_tests_passed,rubric,feedback,reviewed_at,submission_id)
    values(row_data.user_id,row_data.course_id,auth.uid(),total,p_code_tests_passed,p_rubric,btrim(p_feedback),now(),p_submission_id)
    on conflict(user_id,course_id) do update
      set reviewer_id=excluded.reviewer_id,score=excluded.score,
          code_tests_passed=excluded.code_tests_passed,rubric=excluded.rubric,
          feedback=excluded.feedback,reviewed_at=excluded.reviewed_at,
          submission_id=excluded.submission_id;
  return total;
end;
$$;
revoke all on function private.review_cs101_capstone(uuid,jsonb,boolean,text) from public,anon;
grant execute on function private.review_cs101_capstone(uuid,jsonb,boolean,text) to authenticated;
create function public.review_cs101_capstone(
  p_submission_id uuid,p_rubric jsonb,p_code_tests_passed boolean,p_feedback text
) returns integer language sql security invoker set search_path='' as $$
  select private.review_cs101_capstone(p_submission_id,p_rubric,p_code_tests_passed,p_feedback);
$$;
revoke all on function public.review_cs101_capstone(uuid,jsonb,boolean,text) from public,anon;
grant execute on function public.review_cs101_capstone(uuid,jsonb,boolean,text) to authenticated;

-- Credential issuance requires a passing review of an actually submitted
-- capstone snapshot, a staff-verified CodeLab exercise and all ten checks.
create or replace function private.issue_cs101_credential(target_learner uuid)
returns text language plpgsql security definer set search_path='' as $$
declare
  display text;
  code text;
  mastered integer;
begin
  if auth.uid() is null or not private.has_course_role('cs101',array['reviewer','administrator']) then
    raise exception 'Credential reviewer permission required' using errcode='42501';
  end if;
  if target_learner is null or not exists(
    select 1 from public.enrollments
     where user_id=target_learner and course_id='cs101') then
    raise exception 'Learner is not enrolled in CS101';
  end if;
  if not exists(
    select 1 from public.capstone_reviews r
      join public.capstone_submissions s on s.id=r.submission_id
    where r.user_id=target_learner and r.course_id='cs101'
      and s.user_id=r.user_id and s.course_id=r.course_id
      and s.status='reviewed' and r.score>=80 and r.code_tests_passed
  ) then raise exception 'Capstone submission and independent review must pass'; end if;
  if not exists(
    select 1 from public.code_submissions
    where user_id=target_learner and course_id='cs101'
      and status='reviewed' and code_tests_passed
  ) then raise exception 'A reviewed CodeLab submission must pass'; end if;
  select count(distinct m.id) into mastered
    from public.modules m
    join public.lessons l on l.module_id=m.id and l.published
    join public.lesson_progress p on p.lesson_id=l.id
      and p.content_version=l.content_version
      and p.user_id=target_learner and p.completed
    where m.course_id='cs101';
  if mastered<>10 then raise exception 'All ten CS101 modules must be mastered'; end if;
  select display_name into display from public.profiles where user_id=target_learner;
  if display is null then raise exception 'Learner must set a public certificate name'; end if;
  select credential_code into code from public.credentials
    where user_id=target_learner and course_id='cs101';
  if code is not null then return code; end if;
  code:='KH-CS101-'||upper(replace(gen_random_uuid()::text,'-',''));
  insert into public.credentials
    (credential_code,user_id,course_id,recipient_name,title,issued_by,evidence_summary)
    values(code,target_learner,'cs101',display,
      'Computer Science Foundations · CS101',auth.uid(),
      'Ten mastered modules, independently reviewed Python exercise and submitted capstone.');
  insert into public.audit_logs(actor_id,target_user_id,course_id,action,details)
    values(auth.uid(),target_learner,'cs101','credential.issued',
      jsonb_build_object('credential_code',code));
  return code;
end;
$$;
