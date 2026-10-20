-- KHANIVERSITY 0.3: audited CS101 staff access and safe public award lookup.
-- Requires foundation, virtual_university, operational_blueprint and capstone migrations.
-- Anonymous credential lookup remains intentionally public by an unguessable code;
-- the exposed API wrapper is now SECURITY INVOKER, not SECURITY DEFINER.
-- No tables or learner grades are rewritten.

-- Default-deny future private routines for the migration owner.
alter default privileges in schema private revoke execute on functions from public;

create function private.lookup_cs101_credential(p_code text)
returns table(status text,recipient_name text,course_title text,issued_at timestamptz,evidence_summary text)
language sql stable security definer set search_path = '' as $$
  select case when c.revoked_at is null then 'valid' else 'revoked' end,
    c.recipient_name, co.title, c.issued_at, c.evidence_summary
  from public.credentials c join public.courses co on co.id=c.course_id
  where length(btrim(p_code)) between 10 and 80
    and c.credential_code = upper(btrim(p_code));
$$;
revoke all on function private.lookup_cs101_credential(text) from public, anon, authenticated;
-- Only this narrowly scoped credential lookup is callable by anonymous users
-- inside private. Every existing private routine explicitly denies anon execute.
grant usage on schema private to anon;
grant execute on function private.lookup_cs101_credential(text) to anon, authenticated;
create or replace function public.verify_course_credential(p_code text)
returns table(status text,recipient_name text,course_title text,issued_at timestamptz,evidence_summary text)
language sql stable security invoker set search_path = '' as $$
  select * from private.lookup_cs101_credential(p_code);
$$;
revoke all on function public.verify_course_credential(text) from public;
grant execute on function public.verify_course_credential(text) to anon, authenticated;

create function private.revoke_cs101_staff(p_user_id uuid,p_role text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare affected integer;
begin
  if auth.uid() is null or not private.has_course_role('cs101',array['administrator']) then
    raise exception 'Administrator authorization required' using errcode='42501';
  end if;
  if p_user_id is null or p_role not in ('instructor','reviewer','administrator') then
    raise exception 'Valid account and role required';
  end if;
  if p_user_id=auth.uid() then
    raise exception 'Self-revocation is forbidden' using errcode='42501';
  end if;
  delete from public.course_staff
    where user_id=p_user_id and course_id='cs101' and role=p_role;
  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Staff assignment not found';
  end if;
  insert into public.audit_logs(actor_id,target_user_id,course_id,action,details)
    values(auth.uid(),p_user_id,'cs101','staff.role_revoked',
      jsonb_build_object('role',p_role));
  return true;
end;
$$;
revoke all on function private.revoke_cs101_staff(uuid,text) from public,anon;
grant execute on function private.revoke_cs101_staff(uuid,text) to authenticated;
create function public.revoke_cs101_staff(p_user_id uuid,p_role text)
returns boolean language sql security invoker set search_path = '' as $$
  select private.revoke_cs101_staff(p_user_id,p_role);
$$;
revoke all on function public.revoke_cs101_staff(uuid,text) from public,anon;
grant execute on function public.revoke_cs101_staff(uuid,text) to authenticated;
