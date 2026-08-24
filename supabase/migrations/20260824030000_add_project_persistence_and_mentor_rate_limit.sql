create table if not exists public.research_projects (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  schema_version integer not null default 1,
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.research_projects enable row level security;

revoke all on public.research_projects from anon;
grant select, insert, update on public.research_projects to authenticated;

create policy "users_select_own_research_project"
on public.research_projects
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users_insert_own_research_project"
on public.research_projects
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users_update_own_research_project"
on public.research_projects
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table if not exists public.mentor_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.mentor_rate_limits enable row level security;
revoke all on public.mentor_rate_limits from anon, authenticated;

create or replace function public.consume_mentor_rate_limit(
  p_limit integer default 20,
  p_window_seconds integer default 600
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
  v_window_started_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit configuration' using errcode = '22023';
  end if;

  insert into public.mentor_rate_limits as m (
    user_id,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    v_user_id,
    now(),
    1,
    now()
  )
  on conflict (user_id) do update
  set
    window_started_at = case
      when m.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now()
      else m.window_started_at
    end,
    request_count = case
      when m.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1
      else m.request_count + 1
    end,
    updated_at = now()
  returning mentor_rate_limits.request_count, mentor_rate_limits.window_started_at
  into v_count, v_window_started_at;

  return query
  select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_window_started_at + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_mentor_rate_limit(integer, integer) from public, anon;
grant execute on function public.consume_mentor_rate_limit(integer, integer) to authenticated;
