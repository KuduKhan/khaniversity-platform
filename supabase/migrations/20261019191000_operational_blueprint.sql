-- KHANIVERSITY Blueprint v1.0: operational CodeLab + reviewed lesson materials.
-- Student code is evidence for staff review, never an automatically verified grade.
-- This migration is additive and preserves historical lesson assessment versions.
create table public.coding_exercises (
  id text primary key,
  course_id text not null references public.courses(id),
  title text not null check (length(title) between 3 and 120),
  instructions text not null check (length(instructions) between 20 and 4000),
  starter_code text not null check (length(starter_code) <= 6000),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.coding_exercises enable row level security;
revoke all on public.coding_exercises from public,anon,authenticated;
grant select on public.coding_exercises to anon,authenticated;
create policy exercise_catalog_read on public.coding_exercises
  for select to anon,authenticated using (
    published and exists (
      select 1 from public.courses c
      where c.id=coding_exercises.course_id and c.published
    )
  );
insert into public.coding_exercises(id,course_id,title,instructions,starter_code,published) values
 ('total-minutes','cs101','Sum a set of durations',
  'Write total_minutes(durations) to return the sum of the input minutes. Include empty-list and single-item behavior. Run the three browser checks before sending your work for review.',
  'def total_minutes(durations):\n    # Add the supplied study durations\n    return 0\n',true);

create table public.code_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  exercise_id text not null references public.coding_exercises(id),
  source_code text not null check (length(source_code) between 10 and 6000),
  status text not null default 'submitted' check (status in ('submitted','reviewed','needs-work')),
  code_tests_passed boolean not null default false,
  reviewer_id uuid references auth.users(id),
  feedback text not null default '' check (length(feedback) <= 1500),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now()
);
create index code_submissions_owner_date on public.code_submissions(user_id,submitted_at desc);
create index code_submissions_staff_queue on public.code_submissions(course_id,status,submitted_at desc);
alter table public.code_submissions enable row level security;
revoke all on public.code_submissions from public,anon,authenticated;
grant select,insert (user_id,course_id,exercise_id,source_code) on public.code_submissions to authenticated;
create policy code_submissions_owner_read on public.code_submissions
  for select to authenticated using (user_id=(select auth.uid()));
create policy code_submissions_staff_read on public.code_submissions
  for select to authenticated using (
    private.has_course_role(course_id,array['instructor','reviewer','administrator'])
  );
create policy code_submissions_student_insert on public.code_submissions
  for insert to authenticated with check (
    user_id=(select auth.uid()) and status='submitted'
    and code_tests_passed=false and reviewer_id is null
    and feedback='' and reviewed_at is null
    and exists (select 1 from public.enrollments e where e.user_id=(select auth.uid()) and e.course_id=code_submissions.course_id)
    and exists (select 1 from public.coding_exercises ce
      where ce.id=code_submissions.exercise_id and ce.course_id=code_submissions.course_id and ce.published)
  );

-- Instructor-owned proposals are immutable. Only a reviewer-approved action
-- can publish additional explanatory materials (never hidden graded answers).
create table public.lesson_revisions (
  id bigint generated always as identity primary key,
  course_id text not null references public.courses(id),
  lesson_id text not null,
  base_content_version text not null,
  title text not null check (length(btrim(title)) between 5 and 120),
  body text not null check (length(btrim(body)) between 80 and 8000),
  author_id uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  reviewer_id uuid references auth.users(id),
  review_note text not null default '' check (length(review_note) <= 1500),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  foreign key (lesson_id,base_content_version) references public.lessons(id,content_version)
);
create index lesson_revisions_catalog on public.lesson_revisions(course_id,lesson_id,status,id desc);
create index lesson_revisions_author on public.lesson_revisions(author_id,created_at desc);
alter table public.lesson_revisions enable row level security;
revoke all on public.lesson_revisions from public,anon,authenticated;
grant select,insert (course_id,lesson_id,base_content_version,title,body,author_id)
  on public.lesson_revisions to authenticated;
grant usage,select on sequence public.lesson_revisions_id_seq to authenticated;
create policy lesson_revisions_read on public.lesson_revisions
  for select to authenticated using (
    status='published' or author_id=(select auth.uid())
    or private.has_course_role(course_id,array['instructor','reviewer','administrator'])
  );
create policy lesson_revisions_staff_insert on public.lesson_revisions
  for insert to authenticated with check (
    author_id=(select auth.uid()) and status='pending' and reviewer_id is null
    and reviewed_at is null and review_note=''
    and private.has_course_role(course_id,array['instructor','administrator'])
    and exists (select 1 from public.lessons l
      join public.modules m on m.id=l.module_id
      where l.id=lesson_id and l.content_version=base_content_version
      and l.published and m.course_id=lesson_revisions.course_id)
  );

-- Only narrow invoker wrappers may call the private, audited review mutations.
create function private.review_lesson_revision(p_id bigint,p_approve boolean,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.lesson_revisions%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into r from public.lesson_revisions where id=p_id for update;
  if not found then raise exception 'Revision does not exist'; end if;
  if not private.has_course_role(r.course_id,array['reviewer','administrator']) then
    raise exception 'Review permission required' using errcode='42501';
  end if;
  if r.author_id=auth.uid() then raise exception 'A second staff member must review this content' using errcode='42501'; end if;
  if r.status<>'pending' then raise exception 'Revision already reviewed'; end if;
  if length(coalesce(p_note,''))>1500 then raise exception 'Review note too long'; end if;
  update public.lesson_revisions
    set status=case when p_approve then 'published' else 'rejected' end,
      reviewer_id=auth.uid(),reviewed_at=now(),review_note=coalesce(p_note,'')
    where id=p_id;
  insert into public.audit_logs(actor_id,course_id,action,details)
    values (auth.uid(),r.course_id,
      case when p_approve then 'lesson.material_published' else 'lesson.material_rejected' end,
      jsonb_build_object('revision_id',r.id,'lesson_id',r.lesson_id,'base_version',r.base_content_version));
end;
$$;
revoke all on function private.review_lesson_revision(bigint,boolean,text) from public,anon;
grant execute on function private.review_lesson_revision(bigint,boolean,text) to authenticated;
create function public.review_lesson_revision(p_id bigint,p_approve boolean,p_note text)
returns void language sql security invoker set search_path='' as $$
  select private.review_lesson_revision(p_id,p_approve,p_note);
$$;
revoke all on function public.review_lesson_revision(bigint,boolean,text) from public,anon;
grant execute on function public.review_lesson_revision(bigint,boolean,text) to authenticated;

create function private.review_code_submission(p_id uuid,p_passed boolean,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.code_submissions%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into r from public.code_submissions where id=p_id for update;
  if not found then raise exception 'Submission does not exist'; end if;
  if not private.has_course_role(r.course_id,array['instructor','reviewer','administrator']) then
    raise exception 'Course review permission required' using errcode='42501';
  end if;
  if r.user_id=auth.uid() then raise exception 'Self-review is not permitted' using errcode='42501'; end if;
  if r.status<>'submitted' then raise exception 'Already reviewed'; end if;
  if length(coalesce(p_note,''))>1500 then raise exception 'Feedback too long'; end if;
  update public.code_submissions
    set status=case when p_passed then 'reviewed' else 'needs-work' end,
      code_tests_passed=p_passed,reviewer_id=auth.uid(),
      feedback=coalesce(p_note,''),reviewed_at=now()
    where id=p_id;
  insert into public.audit_logs(actor_id,target_user_id,course_id,action,details)
    values (auth.uid(),r.user_id,r.course_id,'codelab.reviewed',
      jsonb_build_object('submission_id',p_id,'passed',p_passed));
end;
$$;
revoke all on function private.review_code_submission(uuid,boolean,text) from public,anon;
grant execute on function private.review_code_submission(uuid,boolean,text) to authenticated;
create function public.review_code_submission(p_id uuid,p_passed boolean,p_note text)
returns void language sql security invoker set search_path='' as $$
  select private.review_code_submission(p_id,p_passed,p_note);
$$;
revoke all on function public.review_code_submission(uuid,boolean,text) from public,anon;
grant execute on function public.review_code_submission(uuid,boolean,text) to authenticated;

-- Course-assigned staff can inspect cohort-level, nonpublic progress counts.
create policy enrollment_course_staff_read on public.enrollments
  for select to authenticated using (
    private.has_course_role(course_id,array['instructor','reviewer','administrator'])
  );
create policy lesson_progress_course_staff_read on public.lesson_progress
  for select to authenticated using (
    exists (select 1 from public.lessons l join public.modules m on l.module_id=m.id
      where l.id=lesson_progress.lesson_id and l.content_version=lesson_progress.content_version
        and private.has_course_role(m.course_id,array['instructor','reviewer','administrator']))
  );
