-- Virtual University expansion: full CS101 records, six schools, projects,
-- cohorts, peer review, staff boundaries and database-verifiable credentials.
alter table public.schools alter column status set default 'active';
update public.schools set status='active';
update public.schools set id='emerging-technologies' where id='emerging';

insert into public.programs(id,school_id,title) values
 ('algorithms-data','computer-science','Algorithms & Data'),
 ('systems-foundations','computer-science','Computing Systems'),
 ('web-applications','software-engineering','Web Applications'),
 ('api-engineering','software-engineering','API Engineering'),
 ('software-quality','software-engineering','Software Quality & Delivery'),
 ('ai-foundations','artificial-intelligence','AI Foundations'),
 ('machine-learning','artificial-intelligence','Machine Learning'),
 ('applied-ai','artificial-intelligence','Applied AI Systems'),
 ('security-foundations','cybersecurity','Security Foundations'),
 ('network-defense','cybersecurity','Network Defense'),
 ('security-operations','cybersecurity','Security Operations'),
 ('infrastructure','cloud','Infrastructure Foundations'),
 ('cloud-platforms','cloud','Cloud Platforms'),
 ('reliability','cloud','Reliability Engineering'),
 ('robotics','emerging-technologies','Robotics Foundations'),
 ('iot','emerging-technologies','Internet of Things'),
 ('embedded-systems','emerging-technologies','Embedded Systems');

insert into public.courses(id,program_id,title,published) values
 ('cs201','algorithms-data','Algorithms & Data Structures',true),
 ('cs220','systems-foundations','How Computing Systems Work',true),
 ('se110','web-applications','Engineering a Web Application',true),
 ('se210','api-engineering','APIs & Service Design',true),
 ('se230','software-quality','Testing & Continuous Delivery',true),
 ('ai101','ai-foundations','Foundations of Artificial Intelligence',true),
 ('ai210','machine-learning','Machine Learning with Data',true),
 ('ai230','applied-ai','Applied Language Model Systems',true),
 ('cy101','security-foundations','Cybersecurity Foundations',true),
 ('cy210','network-defense','Network Defense & Monitoring',true),
 ('cy230','security-operations','Incident Response & Forensics',true),
 ('cl101','infrastructure','Linux & Infrastructure Foundations',true),
 ('cl210','cloud-platforms','Cloud Architecture & Deployment',true),
 ('cl230','reliability','Reliable Cloud Services',true),
 ('et101','robotics','Robotics & Physical Computing',true),
 ('et210','iot','Connected Devices & IoT',true),
 ('et230','embedded-systems','Embedded Systems Design',true);

insert into public.modules(id,course_id,position,title) values
 ('cs101-02','cs101',2,'Programming fundamentals & Python'),
 ('cs101-03','cs101',3,'Variables, data types & input/output'),
 ('cs101-04','cs101',4,'Conditions, loops & control flow'),
 ('cs101-05','cs101',5,'Functions, scope & decomposition'),
 ('cs101-06','cs101',6,'Lists, tuples, dictionaries & sets'),
 ('cs101-07','cs101',7,'Files, exceptions & debugging'),
 ('cs101-08','cs101',8,'Algorithms & complexity'),
 ('cs101-09','cs101',9,'Testing, Git & code quality'),
 ('cs101-10','cs101',10,'Capstone: Personal Study Planner');
insert into public.lessons(id,content_version,module_id,title,published) values
 ('programming-fundamentals','1.0.0','cs101-02','Programming fundamentals & Python',true),
 ('variables-data-input-output','1.0.0','cs101-03','Variables, data types & input/output',true),
 ('conditions-loops','1.0.0','cs101-04','Conditions, loops & control flow',true),
 ('functions-scope','1.0.0','cs101-05','Functions, scope & decomposition',true),
 ('collections','1.0.0','cs101-06','Lists, tuples, dictionaries & sets',true),
 ('files-exceptions-debugging','1.0.0','cs101-07','Files, exceptions & debugging',true),
 ('algorithms-complexity','1.0.0','cs101-08','Algorithms & complexity',true),
 ('testing-git-quality','1.0.0','cs101-09','Testing, Git & code quality',true),
 ('personal-study-planner-capstone','1.0.0','cs101-10','Personal Study Planner capstone',true);

create table private.course_assessment_keys (
  module_id text primary key references public.modules(id) on delete cascade,
  answer_key jsonb not null check(jsonb_typeof(answer_key)='array'),
  published boolean not null default true
);
revoke all on private.course_assessment_keys from public,anon,authenticated;
insert into private.course_assessment_keys(module_id,answer_key) values
 ('cs101-02','[0,1,0,1,0]'),('cs101-03','[1,0,0,1,0]'),
 ('cs101-04','[0,0,0,0,1]'),('cs101-05','[0,0,0,0,0]'),
 ('cs101-06','[0,0,0,0,0]'),('cs101-07','[0,0,0,0,0]'),
 ('cs101-08','[0,0,0,0,0]'),('cs101-09','[0,0,0,0,0]'),
 ('cs101-10','[0,0,0,0,0]');

create table public.assessment_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null references public.modules(id),
  score integer not null check(score between 0 and 100),
  question_count integer not null check(question_count > 0),
  submitted_at timestamptz not null default now()
);
alter table public.assessment_attempts enable row level security;
revoke all on public.assessment_attempts from anon,authenticated;
grant select on public.assessment_attempts to authenticated;
create policy assessment_attempt_read on public.assessment_attempts for select to authenticated using((select auth.uid())=user_id);
create index assessment_attempts_owner on public.assessment_attempts(user_id,module_id,submitted_at desc);

create table public.project_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  title text not null check(length(title) between 1 and 100),
  source_code text not null check(length(source_code) <= 20000),
  reflection text not null default '' check(length(reflection) <= 3000),
  updated_at timestamptz not null default now(),
  primary key(user_id,course_id)
);
alter table public.project_drafts enable row level security;
revoke all on public.project_drafts from anon,authenticated;
grant select,insert,update on public.project_drafts to authenticated;
create policy project_draft_read on public.project_drafts for select to authenticated using((select auth.uid())=user_id);
create policy project_draft_insert on public.project_drafts for insert to authenticated with check((select auth.uid())=user_id and exists(select 1 from public.enrollments e where e.user_id=(select auth.uid()) and e.course_id=project_drafts.course_id));
create policy project_draft_update on public.project_drafts for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create function private.submit_course_check(module_slug text, answers jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  learner uuid := auth.uid();
  module_record text;
  key_value jsonb;
  score_value integer := 0;
  i integer;
begin
  if learner is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.enrollments e where e.user_id=learner and e.course_id='cs101') then
    raise exception 'Enrollment required' using errcode='42501';
  end if;
  select m.id,k.answer_key into module_record,key_value
    from public.modules m join private.course_assessment_keys k on k.module_id=m.id
    join public.courses c on c.id=m.course_id
    where m.id=module_slug and c.id='cs101' and c.published and k.published;
  if module_record is null then raise exception 'Assessment unavailable'; end if;
  if jsonb_typeof(answers) is distinct from 'array' then raise exception 'Invalid answers'; end if;
  if jsonb_array_length(answers) <> jsonb_array_length(key_value) then raise exception 'Answer every question'; end if;
  for i in 0..jsonb_array_length(key_value)-1 loop
    if jsonb_typeof(answers->i) is distinct from 'number' or (answers->>i) not in ('0','1','2') then
      raise exception 'Invalid answer';
    end if;
    if answers->i = key_value->i then score_value := score_value + 20; end if;
  end loop;
  insert into public.assessment_attempts(user_id,module_id,score,question_count)
    values(learner,module_record,score_value,jsonb_array_length(key_value));
  insert into public.lesson_progress(user_id,lesson_id,content_version,score)
    select learner,l.id,l.content_version,score_value from public.lessons l
    join public.modules m on m.id=l.module_id where m.id=module_record and l.published
    on conflict(user_id,lesson_id,content_version) do update
      set score=greatest(public.lesson_progress.score,excluded.score),updated_at=now();
  if not found then raise exception 'Published lesson unavailable'; end if;
  return score_value;
end;
$$;
revoke all on function private.submit_course_check(text,jsonb) from public,anon;
grant execute on function private.submit_course_check(text,jsonb) to authenticated;
create function public.submit_course_check(p_module_id text,p_answers jsonb) returns integer
language sql security invoker set search_path = '' as $$
  select private.submit_course_check(p_module_id,p_answers);
$$;
revoke all on function public.submit_course_check(text,jsonb) from public,anon;
grant execute on function public.submit_course_check(text,jsonb) to authenticated;

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('student','instructor','reviewer','administrator')),
  school_id text references public.schools(id),
  granted_at timestamptz not null default now(),
  primary key(user_id,role)
);
alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon,authenticated;
grant select on public.user_roles to authenticated;
create policy user_roles_self_read on public.user_roles for select to authenticated using((select auth.uid())=user_id);
create function private.has_role(role_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.user_roles r where r.user_id=auth.uid() and r.role=role_name);
$$;
revoke all on function private.has_role(text) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.has_role(text) to authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(length(display_name) between 1 and 60),
  peer_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
create policy profile_self_read on public.profiles for select to authenticated using((select auth.uid())=user_id);
create policy profile_self_insert on public.profiles for insert to authenticated with check((select auth.uid())=user_id);
create policy profile_self_update on public.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create table public.course_staff (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  role text not null check(role in ('instructor','reviewer','administrator')),
  granted_at timestamptz not null default now(),
  primary key(user_id,course_id,role)
);
alter table public.course_staff enable row level security;
revoke all on public.course_staff from anon,authenticated;
grant select on public.course_staff to authenticated;
create policy course_staff_self_read on public.course_staff for select to authenticated using((select auth.uid())=user_id);
create function private.has_course_role(target_course text, allowed_roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.course_staff s where s.user_id=auth.uid() and s.course_id=target_course and s.role=any(allowed_roles));
$$;
revoke all on function private.has_course_role(text,text[]) from public,anon;
grant execute on function private.has_course_role(text,text[]) to authenticated;
create policy project_draft_staff_read on public.project_drafts for select to authenticated using(private.has_course_role(course_id,array['instructor','reviewer','administrator']));
create policy profile_course_staff_read on public.profiles for select to authenticated using(private.has_course_role('cs101',array['instructor','reviewer','administrator']) and exists(select 1 from public.enrollments e where e.user_id=profiles.user_id and e.course_id='cs101'));

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id),
  title text not null check(length(title) between 3 and 100),
  join_code text not null unique default replace(gen_random_uuid()::text,'-',''),
  created_by uuid not null references auth.users(id),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.cohort_memberships (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(cohort_id,user_id)
);
create table public.cohort_posts (
  id bigint generated always as identity primary key,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id bigint references public.cohort_posts(id) on delete cascade,
  post_type text not null default 'discussion' check(post_type in ('discussion','project-update')),
  body text not null check(length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cohorts enable row level security;
alter table public.cohort_memberships enable row level security;
alter table public.cohort_posts enable row level security;
revoke all on public.cohorts,public.cohort_memberships,public.cohort_posts from anon,authenticated;
grant select on public.cohorts,public.cohort_memberships,public.cohort_posts to authenticated;
grant insert,update,delete on public.cohort_posts to authenticated;
create function private.is_cohort_member(target_cohort uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cohort_memberships m where m.cohort_id=target_cohort and m.user_id=auth.uid());
$$;
revoke all on function private.is_cohort_member(uuid) from public,anon;
grant execute on function private.is_cohort_member(uuid) to authenticated;
create function private.in_shared_cohort(target_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cohort_memberships a join public.cohort_memberships b on b.cohort_id=a.cohort_id where a.user_id=auth.uid() and b.user_id=target_user);
$$;
revoke all on function private.in_shared_cohort(uuid) from public,anon;
grant execute on function private.in_shared_cohort(uuid) to authenticated;
create policy profile_peer_read on public.profiles for select to authenticated using(peer_visible and private.in_shared_cohort(user_id));
create policy cohort_read_member on public.cohorts for select to authenticated using(private.is_cohort_member(id) or private.has_course_role(course_id,array['instructor','reviewer','administrator']));
create policy cohort_member_read on public.cohort_memberships for select to authenticated using(private.is_cohort_member(cohort_id));
create policy cohort_posts_read on public.cohort_posts for select to authenticated using(private.is_cohort_member(cohort_id));
create policy cohort_posts_insert on public.cohort_posts for insert to authenticated with check(user_id=(select auth.uid()) and private.is_cohort_member(cohort_id) and (parent_id is null or exists(select 1 from public.cohort_posts p where p.id=parent_id and p.cohort_id=cohort_posts.cohort_id)));
create policy cohort_posts_update on public.cohort_posts for update to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.cohorts c where c.id=cohort_id and private.has_course_role(c.course_id,array['instructor','administrator']))) with check(private.is_cohort_member(cohort_id));
create policy cohort_posts_delete on public.cohort_posts for delete to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.cohorts c where c.id=cohort_id and private.has_course_role(c.course_id,array['instructor','administrator'])));
create index cohort_posts_timeline on public.cohort_posts(cohort_id,created_at desc);

create function private.create_cohort(target_course text, cohort_title text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  if not private.has_course_role(target_course,array['instructor','administrator']) then raise exception 'Course staff permission required' using errcode='42501'; end if;
  insert into public.cohorts(course_id,title,created_by) values(target_course,trim(cohort_title),auth.uid()) returning id into result;
  insert into public.cohort_memberships(cohort_id,user_id) values(result,auth.uid());
  return result;
end;
$$;
revoke all on function private.create_cohort(text,text) from public,anon;
grant execute on function private.create_cohort(text,text) to authenticated;
create function public.create_course_cohort(p_course_id text,p_title text) returns uuid
language sql security invoker set search_path = '' as $$ select private.create_cohort(p_course_id,p_title); $$;
revoke all on function public.create_course_cohort(text,text) from public,anon;
grant execute on function public.create_course_cohort(text,text) to authenticated;

create function private.join_cohort(invite_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid; target_course text;
begin
  select c.id,c.course_id into result,target_course from public.cohorts c where c.join_code=trim(invite_code) and c.active;
  if result is null then raise exception 'Invite code is invalid or inactive'; end if;
  if not exists(select 1 from public.enrollments e where e.user_id=auth.uid() and e.course_id=target_course) then raise exception 'Enroll in this course before joining its cohort' using errcode='42501'; end if;
  insert into public.cohort_memberships(cohort_id,user_id) values(result,auth.uid()) on conflict do nothing;
  return result;
end;
$$;
revoke all on function private.join_cohort(text) from public,anon;
grant execute on function private.join_cohort(text) to authenticated;
create function public.join_course_cohort(p_invite_code text) returns uuid
language sql security invoker set search_path = '' as $$ select private.join_cohort(p_invite_code); $$;
revoke all on function public.join_course_cohort(text) from public,anon;
grant execute on function public.join_course_cohort(text) to authenticated;

create table public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  title text not null check(length(title) between 1 and 100),
  summary text not null check(length(summary) between 20 and 3000),
  source_code text not null check(length(source_code) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.peer_reviews (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.project_submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  clarity integer not null check(clarity between 1 and 5),
  correctness integer not null check(correctness between 1 and 5),
  testing integer not null check(testing between 1 and 5),
  feedback text not null check(length(feedback) between 20 and 2000),
  created_at timestamptz not null default now(),
  unique(submission_id,reviewer_id)
);
alter table public.project_submissions enable row level security;
alter table public.peer_reviews enable row level security;
revoke all on public.project_submissions,public.peer_reviews from anon,authenticated;
grant select,insert,update,delete on public.project_submissions to authenticated;
grant select,insert on public.peer_reviews to authenticated;
create policy project_submission_read on public.project_submissions for select to authenticated using(user_id=(select auth.uid()) or private.is_cohort_member(cohort_id));
create policy project_submission_insert on public.project_submissions for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.enrollments e where e.user_id=(select auth.uid()) and e.course_id=project_submissions.course_id) and private.is_cohort_member(cohort_id) and exists(select 1 from public.cohorts c where c.id=cohort_id and c.course_id=project_submissions.course_id));
create policy project_submission_update on public.project_submissions for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy project_submission_delete on public.project_submissions for delete to authenticated using(user_id=(select auth.uid()));
create policy peer_review_read on public.peer_reviews for select to authenticated using(reviewer_id=(select auth.uid()) or exists(select 1 from public.project_submissions s where s.id=submission_id and s.user_id=(select auth.uid())));
create policy peer_review_insert on public.peer_reviews for insert to authenticated with check(reviewer_id=(select auth.uid()) and exists(select 1 from public.project_submissions s where s.id=submission_id and s.user_id<>(select auth.uid()) and private.is_cohort_member(s.cohort_id)));
create index project_submission_cohort on public.project_submissions(cohort_id,created_at desc);

create table public.capstone_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  reviewer_id uuid not null references auth.users(id),
  score integer not null check(score between 0 and 100),
  code_tests_passed boolean not null,
  rubric jsonb not null check(jsonb_typeof(rubric)='object'),
  feedback text not null check(length(feedback) between 20 and 3000),
  reviewed_at timestamptz not null default now(),
  primary key(user_id,course_id)
);
alter table public.capstone_reviews enable row level security;
revoke all on public.capstone_reviews from anon,authenticated;
grant select,insert,update on public.capstone_reviews to authenticated;
create policy capstone_review_read on public.capstone_reviews for select to authenticated using(user_id=(select auth.uid()) or private.has_course_role(course_id,array['instructor','reviewer','administrator']));
create policy capstone_review_insert on public.capstone_reviews for insert to authenticated with check(private.has_course_role(course_id,array['instructor','reviewer','administrator']) and reviewer_id=(select auth.uid()) and exists(select 1 from public.enrollments e where e.user_id=capstone_reviews.user_id and e.course_id=capstone_reviews.course_id));
create policy capstone_review_update on public.capstone_reviews for update to authenticated using(private.has_course_role(course_id,array['instructor','reviewer','administrator'])) with check(private.has_course_role(course_id,array['instructor','reviewer','administrator']) and reviewer_id=(select auth.uid()));

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  target_user_id uuid references auth.users(id),
  course_id text references public.courses(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from anon,authenticated;
grant select on public.audit_logs to authenticated;
create policy audit_staff_read on public.audit_logs for select to authenticated using(private.has_course_role(course_id,array['administrator','reviewer']));
create function private.audit_capstone_review() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs(actor_id,target_user_id,course_id,action,details)
    values(auth.uid(),new.user_id,new.course_id,'capstone.reviewed',jsonb_build_object('score',new.score,'code_tests_passed',new.code_tests_passed));
  return new;
end;
$$;
revoke all on function private.audit_capstone_review() from public,anon,authenticated;
create trigger capstone_review_audit after insert or update on public.capstone_reviews
for each row execute function private.audit_capstone_review();

create table public.credentials (
  credential_code text primary key,
  user_id uuid not null references auth.users(id),
  course_id text not null references public.courses(id),
  recipient_name text not null check(length(recipient_name) between 1 and 100),
  title text not null,
  issued_at timestamptz not null default now(),
  issued_by uuid not null references auth.users(id),
  evidence_summary text not null,
  revoked_at timestamptz,
  revocation_reason text,
  unique(user_id,course_id)
);
alter table public.credentials enable row level security;
revoke all on public.credentials from anon,authenticated;
grant select on public.credentials to authenticated;
create policy credential_owner_read on public.credentials for select to authenticated using(user_id=(select auth.uid()));

create function private.issue_cs101_credential(target_learner uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare learner uuid; display text; code text; required_modules integer;
begin
  if not private.has_course_role('cs101',array['reviewer','administrator']) then raise exception 'Credential reviewer permission required' using errcode='42501'; end if;
  learner := target_learner;
  if learner is null or not exists(select 1 from public.enrollments e where e.user_id=learner and e.course_id='cs101') then raise exception 'Learner is not enrolled in CS101'; end if;
  if not exists(select 1 from public.capstone_reviews r where r.user_id=learner and r.course_id='cs101' and r.score>=80 and r.code_tests_passed) then raise exception 'Capstone review and coding checks must pass'; end if;
  select count(*) into required_modules from public.modules m join public.lessons l on l.module_id=m.id and l.published join public.lesson_progress p on p.lesson_id=l.id and p.content_version=l.content_version and p.user_id=learner and p.completed where m.course_id='cs101';
  if required_modules < 10 then raise exception 'All ten CS101 modules must be mastered'; end if;
  select display_name into display from public.profiles where user_id=learner;
  if display is null then raise exception 'Learner must set a public certificate name'; end if;
  select credential_code into code from public.credentials where user_id=learner and course_id='cs101';
  if code is not null then return code; end if;
  code := 'KH-CS101-' || upper(replace(gen_random_uuid()::text,'-',''));
  insert into public.credentials(credential_code,user_id,course_id,recipient_name,title,issued_by,evidence_summary)
    values(code,learner,'cs101',display,'Computer Science Foundations · CS101',auth.uid(),'Ten module mastery, required coding checks and reviewed capstone rubric.');
  insert into public.audit_logs(actor_id,target_user_id,course_id,action,details)
    values(auth.uid(),learner,'cs101','credential.issued',jsonb_build_object('credential_code',code));
  return code;
end;
$$;
revoke all on function private.issue_cs101_credential(uuid) from public,anon;
grant execute on function private.issue_cs101_credential(uuid) to authenticated;
create function public.issue_cs101_credential(p_learner uuid) returns text
language sql security invoker set search_path = '' as $$ select private.issue_cs101_credential(p_learner); $$;
revoke all on function public.issue_cs101_credential(uuid) from public,anon;
grant execute on function public.issue_cs101_credential(uuid) to authenticated;

create function public.verify_course_credential(p_code text)
returns table(status text,recipient_name text,course_title text,issued_at timestamptz,evidence_summary text)
language sql stable security definer set search_path = '' as $$
  select case when c.revoked_at is null then 'valid' else 'revoked' end,
    c.recipient_name,co.title,c.issued_at,c.evidence_summary
  from public.credentials c join public.courses co on co.id=c.course_id
  where c.credential_code=upper(trim(p_code));
$$;
revoke all on function public.verify_course_credential(text) from public;
grant execute on function public.verify_course_credential(text) to anon,authenticated;

create index lesson_progress_owner on public.lesson_progress(user_id,lesson_id);
create index course_staff_scope on public.course_staff(course_id,user_id,role);
create index cohort_membership_user on public.cohort_memberships(user_id,cohort_id);
