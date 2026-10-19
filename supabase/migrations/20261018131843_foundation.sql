-- Foundation 0.1. Original schema migration. Keep immutable after deployment.
create schema if not exists private;
revoke all on schema private from public;

create table public.schools (
  id text primary key, title text not null, status text not null check(status in ('active','planned'))
);
create table public.programs (
  id text primary key, school_id text not null references public.schools(id), title text not null
);
create table public.courses (
  id text primary key, program_id text not null references public.programs(id), title text not null, published boolean not null default false
);
create table public.modules (
  id text primary key, course_id text not null references public.courses(id), position integer not null, title text not null,
  unique(course_id,position)
);
create table public.lessons (
  id text not null, content_version text not null, module_id text not null references public.modules(id),
  title text not null, published boolean not null default false, primary key(id,content_version)
);
create table public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id), enrolled_at timestamptz not null default now(),
  primary key(user_id,course_id)
);
create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null, content_version text not null,
  score integer not null check(score between 0 and 100),
  completed boolean generated always as (score >= 80) stored,
  updated_at timestamptz not null default now(),
  primary key(user_id,lesson_id,content_version),
  foreign key(lesson_id,content_version) references public.lessons(id,content_version)
);

alter table public.schools enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
revoke all on public.schools,public.programs,public.courses,public.modules,public.lessons,public.enrollments,public.lesson_progress from anon,authenticated;
grant select on public.schools,public.programs,public.courses,public.modules,public.lessons to anon,authenticated;
grant select,insert on public.enrollments to authenticated;
grant select on public.lesson_progress to authenticated;

create policy schools_read on public.schools for select to anon,authenticated using(true);
create policy programs_read on public.programs for select to anon,authenticated using(true);
create policy courses_read on public.courses for select to anon,authenticated using(published);
create policy modules_read on public.modules for select to anon,authenticated using(exists(select 1 from public.courses c where c.id=course_id and c.published));
create policy lessons_read on public.lessons for select to anon,authenticated using(published and exists(select 1 from public.modules m join public.courses c on c.id=m.course_id where m.id=module_id and c.published));
create policy enrollment_read on public.enrollments for select to authenticated using((select auth.uid())=user_id);
create policy enrollment_insert on public.enrollments for insert to authenticated with check((select auth.uid())=user_id and exists(select 1 from public.courses c where c.id=course_id and c.published));
create policy progress_read on public.lesson_progress for select to authenticated using((select auth.uid())=user_id);

insert into public.schools values
 ('computer-science','School of Computer Science','active'),
 ('software-engineering','School of Software Engineering','planned'),
 ('artificial-intelligence','School of Artificial Intelligence','planned'),
 ('cybersecurity','School of Cybersecurity','planned'),
 ('cloud','School of Cloud & Infrastructure','planned'),
 ('emerging','School of Emerging Technologies','planned');
insert into public.programs values('cs-foundations','computer-science','Computer Science Foundations');
insert into public.courses values('cs101','cs-foundations','Introduction to Computer Science & Python',true);
insert into public.modules values('cs101-01','cs101',1,'Computer systems & computational thinking');
insert into public.lessons values('computational-thinking','0.1.0','cs101-01','Computational thinking',true);

-- The only privileged function lives in a non-exposed schema. Its narrow grant
-- supports the public invoker wrapper; identity and ownership are checked inside.
create function private.score_foundation(answers jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  learner uuid := auth.uid();
  answer_key jsonb := '[1,2,0,2,1]'::jsonb;
  score_value integer := 0;
  i integer;
begin
  if learner is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.enrollments e where e.user_id=learner and e.course_id='cs101') then
    raise exception 'Enrollment required' using errcode='42501';
  end if;
  if jsonb_typeof(answers) is distinct from 'array' then raise exception 'Invalid answers'; end if;
  if jsonb_array_length(answers) <> 5 then raise exception 'Answer all five questions'; end if;
  for i in 0..4 loop
    if jsonb_typeof(answers->i) is distinct from 'number' or (answers->>i) not in ('0','1','2') then
      raise exception 'Invalid answer';
    end if;
    if answers->i = answer_key->i then score_value := score_value + 20; end if;
  end loop;
  insert into public.lesson_progress(user_id,lesson_id,content_version,score)
    values(learner,'computational-thinking','0.1.0',score_value)
    on conflict(user_id,lesson_id,content_version) do update
      set score=greatest(public.lesson_progress.score,excluded.score), updated_at=now();
  return score_value;
end;
$$;
revoke all on function private.score_foundation(jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.score_foundation(jsonb) to authenticated;
create function public.submit_foundation_check(answers jsonb) returns integer
language sql security invoker set search_path = '' as $$ select private.score_foundation(answers); $$;
revoke all on function public.submit_foundation_check(jsonb) from public,anon;
grant execute on function public.submit_foundation_check(jsonb) to authenticated;

-- Indexes cover catalog foreign-key reads and cascade/ownership lookups.
create index programs_school on public.programs(school_id);
create index courses_program on public.courses(program_id);
create index lessons_module on public.lessons(module_id);
create index enrollment_course on public.enrollments(course_id);
create index progress_lesson on public.lesson_progress(lesson_id,content_version);
